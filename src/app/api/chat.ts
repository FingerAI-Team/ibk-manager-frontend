import { SearchFilters } from '../components/chat-content/search-filters';

export interface ChatData {
  id: string; // 백엔드에서 string으로 반환됨
  timestamp: string;
  userId: string;
  question: string;
  answer: string; // 답변 내용 추가
  isStock: boolean;
}

interface ChatResponse {
  items: ChatData[];
  total: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';  // 로컬 백엔드 서버로 변경
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