import { ApiResponse, UserClickRankingResponse, ClickRatioResponse } from './types';
import { fetchWithAuth } from '@/utils/fetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';  // 로컬 백엔드 서버로 변경
const BASE_URL = API_BASE_URL+'/click-analytics';

// 사용자별 클릭/대화 데이터 조회
export async function getUserClickRanking(
  startDate: string,
  endDate: string
): Promise<ApiResponse<UserClickRankingResponse>> {
  return fetchWithAuth(
    `${BASE_URL}/user-ranking?startDate=${startDate}&endDate=${endDate}`
  );
}

// 클릭 비율 데이터 조회
export async function getClickRatio(
  startDate: string,
  endDate: string
): Promise<ApiResponse<ClickRatioResponse>> {
  return fetchWithAuth(
    `${BASE_URL}/ratio?startDate=${startDate}&endDate=${endDate}`
  );
} 