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
  
  // tenantId를 media로 변환
  if (data.items && data.items.length > 0) {
    console.log('🔍 변환 전 원본 데이터 샘플:', data.items.slice(0, 5).map((item: any) => ({
      id: item.id,
      tenantId: item.tenantId,
      tenantIdType: typeof item.tenantId,
      tenantIdValue: JSON.stringify(item.tenantId),
      hasTenantId: 'tenantId' in item,
      allKeys: Object.keys(item)
    })));
    
    data.items = data.items.map((item: any) => {
      // tenantId를 media로 매핑
      const tenantToMedia: { [key: string]: string } = {
        'ibks': 'MTS',
        'ibk': 'i-One Bank',
        'null': '전체',
        'undefined': '전체',
        null: '전체',
        undefined: '전체'
      };
      
      // tenantId 값 확인 및 매핑
      const tenantIdValue = item.tenantId;
      let mappedMedia = '전체'; // 기본값
      
      if (tenantIdValue === null || tenantIdValue === undefined || tenantIdValue === '') {
        mappedMedia = '전체';
      } else if (tenantToMedia[tenantIdValue]) {
        mappedMedia = tenantToMedia[tenantIdValue];
      } else {
        // 예상치 못한 값인 경우 로깅
        console.warn('⚠️ 예상치 못한 tenantId 값:', {
          tenantId: tenantIdValue,
          type: typeof tenantIdValue,
          itemId: item.id
        });
        mappedMedia = '전체';
      }
      
      item.media = mappedMedia;
      
      console.log('🔄 매체 구분 변환:', {
        originalTenantId: tenantIdValue,
        tenantIdType: typeof tenantIdValue,
        mappedMedia: mappedMedia,
        itemId: item.id
      });
      
      return item;
    });
    
    console.log('📱 매체 구분 변환 후 샘플:', data.items.slice(0, 5).map((item: any) => ({
      id: item.id,
      tenantId: item.tenantId,
      media: item.media,
      hasMedia: 'media' in item
    })));
  }
  
  return data;
}

// 전체 데이터를 조회하는 함수 (엑셀 다운로드용)
export async function fetchAllChatData(filters: SearchFilters, totalCount: number): Promise<ChatData[]> {
  console.log(`🔄 전체 데이터 조회 시작... (총 ${totalCount}개 예상)`);
  
  const allData: ChatData[] = [];
  let page = 0;
  const pageSize = 100; // 백엔드 제한: 최대 100개
  const maxPages = Math.min(Math.ceil(totalCount / pageSize), 100); // 최대 100페이지 (10,000개)
  
  if (totalCount > 10000) {
    console.warn(`⚠️ 데이터가 10,000개를 초과합니다. 최대 10,000개까지만 다운로드됩니다.`);
  }
  
  for (let i = 0; i < maxPages; i++) {
    try {
      console.log(`📄 페이지 ${page + 1}/${maxPages} 조회 중...`);
      
      const response = await fetchChatList(filters, page, pageSize);
      
      if (response.items.length === 0) {
        console.log('📄 더 이상 데이터가 없습니다.');
        break;
      }
      
      allData.push(...response.items);
      console.log(`✅ 페이지 ${page + 1}: ${response.items.length}개 데이터 추가 (총 ${allData.length}개)`);
      
      // 마지막 페이지인지 확인
      if (response.items.length < pageSize || allData.length >= totalCount) {
        console.log('📄 마지막 페이지에 도달했습니다.');
        break;
      }
      
      page++;
      
    } catch (error) {
      console.error(`❌ 페이지 ${page + 1} 조회 실패:`, error);
      throw error;
    }
  }
  
  console.log(`🎉 전체 데이터 조회 완료: ${allData.length}개`);
  return allData;
}
