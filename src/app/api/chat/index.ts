import { SearchFilters } from '../../components/chat-content/search-filters';
import { ChatData, ChatResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ibkai.fingerservice.co.kr/api';  // 원래 서버 주소로 복원

export async function fetchChatList(
  filters: SearchFilters, 
  page: number = 0, 
  pageSize: number = 10
): Promise<ChatResponse> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    startDate: filters.startDate || '',  // 필수 필드 - 빈 값이라도 전달
    endDate: filters.endDate || '',      // 필수 필드 - 빈 값이라도 전달
    ...(filters.isStock !== 'all' && { isStock: filters.isStock }),
    ...(filters.userId && { userId: filters.userId }),
    ...(filters.keyword && { keyword: filters.keyword })
  });

  const fullUrl = `${API_BASE_URL}/chats?${queryParams}`;
  console.log('🔗 API URL:', fullUrl);
  
  const response = await fetch(fullUrl);
  
  console.log('📡 Response status:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error:', errorText);
    throw new Error(`Failed to fetch chat list: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ API Response data:', data);
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
