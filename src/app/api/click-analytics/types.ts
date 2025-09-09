// 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// 사용자 클릭/대화 랭킹 데이터
export interface UserClickData {
  userId: string;
  userName: string;
  clicks: number;
  chats: number;
}

export interface UserClickRankingResponse {
  data: UserClickData[];
}

// 클릭 비율 데이터
export interface ClickRatioData {
  clicked: {
    users: number;
    chats: number;
  };
  notClicked: {
    users: number;
    chats: number;
  };
}

export interface ClickRatioResponse {
  data: ClickRatioData;
} 