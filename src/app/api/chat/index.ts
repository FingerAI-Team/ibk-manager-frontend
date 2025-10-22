import { SearchFilters } from '../../components/chat-content/search-filters';
import { ChatData, ChatResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ibkai.fingerservice.co.kr/api';  // 원래 서버 주소로 복원

export async function fetchChatList(
  filters: SearchFilters, 
  page: number = 0, 
  pageSize: number = 10
): Promise<ChatResponse> {
  // 디버깅을 위한 필터 정보 로깅
  console.log('🔍 필터 정보:', {
    startDate: filters.startDate,
    endDate: filters.endDate,
    isStock: filters.isStock,
    media: filters.media,
    userId: filters.userId,
    keyword: filters.keyword
  });
  
  // 매체 구분 필터 상세 로깅
  console.log('📱 매체 구분 필터 상세:', {
    mediaValue: filters.media,
    isNotAll: filters.media !== 'all',
    willIncludeInParams: filters.media !== 'all' && filters.media
  });

  // 매체 구분을 tenant_id로 매핑
  const getTenantId = (media: string) => {
    const mapping: { [key: string]: string | null } = {
      'all': null,
      'MTS': 'ibks',
      'i-One Bank': 'ibk'
    };
    return mapping[media] || null;
  };

  const tenantId = getTenantId(filters.media);
  
  console.log('🏢 Tenant ID 매핑:', {
    media: filters.media,
    mappedTenantId: tenantId,
    willIncludeInParams: tenantId !== null
  });
  
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    startDate: filters.startDate || '',  // 필수 필드 - 빈 값이라도 전달
    endDate: filters.endDate || '',      // 필수 필드 - 빈 값이라도 전달
    ...(filters.isStock !== 'all' && { isStock: filters.isStock }),
    ...(tenantId !== null && { tenant_id: tenantId }), // media 대신 tenant_id 사용
    ...(filters.userId && { userId: filters.userId }),
    ...(filters.keyword && { keyword: filters.keyword })
  });

  const fullUrl = `${API_BASE_URL}/chats?${queryParams}`;
  console.log('🔗 API URL:', fullUrl);
  console.log('📋 쿼리 파라미터:', queryParams.toString());
  
  const response = await fetch(fullUrl);
  
  console.log('📡 Response status:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error:', errorText);
    throw new Error(`Failed to fetch chat list: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ API Response data:', data);
  
  // total 값 상세 로깅
  console.log('📊 Total 값 확인:', {
    total: data.total,
    totalType: typeof data.total,
    hasTotal: 'total' in data,
    itemsLength: data.items?.length || 0,
    fullResponse: data
  });
  
  // tenant_id를 매체명으로 변환 (UI 표시용)
  if (data.items && data.items.length > 0) {
    console.log('🔍 변환 전 원본 데이터 샘플:', data.items.slice(0, 5).map((item: any) => ({
      id: item.id,
      tenant_id: item.tenant_id,
      tenantIdType: typeof item.tenant_id,
      tenantIdValue: JSON.stringify(item.tenant_id),
      hasTenantId: 'tenant_id' in item,
      allKeys: Object.keys(item)
    })));
    
    data.items = data.items.map((item: any) => {
      // tenant_id를 매체명으로 매핑 (UI 표시용)
      const tenantToMediaName: { [key: string]: string } = {
        'ibks': 'MTS',
        'ibk': 'i-One Bank'
      };
      
      // tenant_id 값 확인 및 매핑
      const tenantIdValue = item.tenant_id;
      let mediaName = '전체'; // 기본값
      
      if (tenantIdValue === null || tenantIdValue === undefined || tenantIdValue === '') {
        mediaName = '전체';
      } else if (tenantToMediaName[tenantIdValue]) {
        mediaName = tenantToMediaName[tenantIdValue];
      } else {
        // 예상치 못한 값인 경우 로깅
        console.warn('⚠️ 예상치 못한 tenant_id 값:', {
          tenant_id: tenantIdValue,
          type: typeof tenantIdValue,
          itemId: item.id
        });
        mediaName = '전체';
      }
      
      // UI 표시용 매체명 추가 (기존 tenant_id는 유지)
      item.mediaName = mediaName;
      
      console.log('🔄 매체명 변환:', {
        originalTenantId: tenantIdValue,
        tenantIdType: typeof tenantIdValue,
        mediaName: mediaName,
        itemId: item.id
      });
      
      return item;
    });
    
    console.log('📱 매체명 변환 후 샘플:', data.items.slice(0, 5).map((item: any) => ({
      id: item.id,
      tenant_id: item.tenant_id,
      mediaName: item.mediaName,
      hasMediaName: 'mediaName' in item
    })));
  }
  
  return data;
}

// 전체 데이터를 조회하는 함수 (엑셀 다운로드용) - 병렬 처리 최적화
export async function fetchAllChatData(filters: SearchFilters, totalCount: number): Promise<ChatData[]> {
  console.log(`🔄 전체 데이터 조회 시작... (총 ${totalCount}개 예상)`);
  
  const pageSize = 100; // 백엔드 제한: 최대 100개
  const maxPages = Math.min(Math.ceil(totalCount / pageSize), 100); // 최대 100페이지 (10,000개)
  
  if (totalCount > 10000) {
    console.warn(`⚠️ 데이터가 10,000개를 초과합니다. 최대 10,000개까지만 다운로드됩니다.`);
  }

  // 병렬 처리를 위한 청크 단위로 나누기 (한 번에 5개 페이지씩 처리)
  const chunkSize = 5;
  const allData: ChatData[] = [];
  
  for (let chunkStart = 0; chunkStart < maxPages; chunkStart += chunkSize) {
    const chunkEnd = Math.min(chunkStart + chunkSize, maxPages);
    const chunkPages = Array.from({ length: chunkEnd - chunkStart }, (_, i) => chunkStart + i);
    
    console.log(`📄 청크 ${Math.floor(chunkStart / chunkSize) + 1} 처리 중... (페이지 ${chunkStart + 1}-${chunkEnd})`);
    
    try {
      // 병렬로 여러 페이지를 동시에 요청
      const chunkPromises = chunkPages.map(page => 
        fetchChatList(filters, page, pageSize).catch(error => {
          console.error(`❌ 페이지 ${page + 1} 조회 실패:`, error);
          return { items: [], total: 0 };
        })
      );
      
      const chunkResponses = await Promise.all(chunkPromises);
      
      // 응답 데이터를 합치기
      for (const response of chunkResponses) {
        if (response.items.length > 0) {
          allData.push(...response.items);
        }
      }
      
      console.log(`✅ 청크 완료: ${allData.length}개 데이터 누적`);
      
      // 데이터가 부족하면 중단
      if (chunkResponses.some(response => response.items.length < pageSize)) {
        console.log('📄 마지막 페이지에 도달했습니다.');
        break;
      }
      
    } catch (error) {
      console.error(`❌ 청크 처리 실패:`, error);
      throw error;
    }
  }
  
  console.log(`🎉 전체 데이터 조회 완료: ${allData.length}개`);
  return allData;
}

// 진행률 콜백을 지원하는 전체 데이터 조회 함수
export async function fetchAllChatDataWithProgress(
  filters: SearchFilters, 
  totalCount: number, 
  onProgress: (current: number, total: number, message: string) => void
): Promise<ChatData[]> {
  console.log(`🔄 전체 데이터 조회 시작... (총 ${totalCount}개 예상)`);
  
  const pageSize = 100;
  const maxPages = Math.min(Math.ceil(totalCount / pageSize), 100);
  
  if (totalCount > 10000) {
    console.warn(`⚠️ 데이터가 10,000개를 초과합니다. 최대 10,000개까지만 다운로드됩니다.`);
  }

  const chunkSize = 5;
  const allData: ChatData[] = [];
  
  for (let chunkStart = 0; chunkStart < maxPages; chunkStart += chunkSize) {
    const chunkEnd = Math.min(chunkStart + chunkSize, maxPages);
    const chunkPages = Array.from({ length: chunkEnd - chunkStart }, (_, i) => chunkStart + i);
    
    const progress = Math.min((chunkStart / maxPages) * 100, 100);
    onProgress(Math.floor(progress), 100, `데이터 조회 중... (${allData.length}/${totalCount})`);
    
    console.log(`📄 청크 ${Math.floor(chunkStart / chunkSize) + 1} 처리 중... (페이지 ${chunkStart + 1}-${chunkEnd})`);
    
    try {
      const chunkPromises = chunkPages.map(page => 
        fetchChatList(filters, page, pageSize).catch(error => {
          console.error(`❌ 페이지 ${page + 1} 조회 실패:`, error);
          return { items: [], total: 0 };
        })
      );
      
      const chunkResponses = await Promise.all(chunkPromises);
      
      for (const response of chunkResponses) {
        if (response.items.length > 0) {
          allData.push(...response.items);
        }
      }
      
      console.log(`✅ 청크 완료: ${allData.length}개 데이터 누적`);
      
      if (chunkResponses.some(response => response.items.length < pageSize)) {
        console.log('📄 마지막 페이지에 도달했습니다.');
        break;
      }
      
    } catch (error) {
      console.error(`❌ 청크 처리 실패:`, error);
      throw error;
    }
  }
  
  onProgress(100, 100, '데이터 조회 완료');
  console.log(`🎉 전체 데이터 조회 완료: ${allData.length}개`);
  return allData;
}
