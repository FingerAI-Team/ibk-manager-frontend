// 채팅 데이터 타입
export interface ChatData {
  id: string; // 백엔드에서 string으로 반환됨
  timestamp: string;
  userId: string;
  question: string;
  answer: string; // 답변 내용 추가
  isStock: boolean;
}

// 채팅 응답 타입
export interface ChatResponse {
  items: ChatData[];
  total: number;
}
