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
    startDate: filters.startDate || '',  // 필수 파라미터
    endDate: filters.endDate || '',      // 필수 파라미터
    ...(filters.isStock !== 'all' && { isStock: filters.isStock }),
    ...(filters.userId && { userId: filters.userId }),
    ...(filters.keyword && { keyword: filters.keyword })
  });

  // 빈 값 제거
  Array.from(queryParams.entries()).forEach(([key, value]) => {
    if (!value) queryParams.delete(key);
  });

  const response = await fetch(`${API_BASE_URL}/chats?${queryParams}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch chat list');
  }

  return response.json();
} 