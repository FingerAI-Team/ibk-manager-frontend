import { ApiResponse, DailyChartResponse, HourlyChartResponse, WeekdayChartResponse, UserRankingResponse } from './types';
import { fetchWithAuth } from '@/utils/fetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://ibkai.fingerservice.co.kr/api';  // API 서버 주소 추가
const BASE_URL = API_BASE_URL+'/chat-analytics';

// 일별 차트 데이터 조회
export async function getDailyChartData(startDate: string, endDate: string): Promise<ApiResponse<DailyChartResponse>> {
  return fetchWithAuth(`${BASE_URL}/daily?startDate=${startDate}&endDate=${endDate}`);
}

// 시간대별 차트 데이터 조회
export async function getHourlyChartData(dateType: string, startDate?: string, endDate?: string): Promise<ApiResponse<HourlyChartResponse>> {
  let url = `${BASE_URL}/hourly?dateType=${dateType}`;
  if (dateType === 'custom' && startDate && endDate) {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }
  return fetchWithAuth(url);
}

// 요일별 차트 데이터 조회
export async function getWeekdayChartData(year: number, month: number): Promise<ApiResponse<WeekdayChartResponse>> {
  return fetchWithAuth(`${BASE_URL}/weekday?year=${year}&month=${month}`);
}

// 사용자 랭킹 데이터 조회
export async function getUserRankingData(
  period: string,
  limit: number,
  sortOrder: 'asc' | 'desc',
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<UserRankingResponse>> {
  let url = `${BASE_URL}/ranking?period=${period}&limit=${limit}&sortOrder=${sortOrder}`;
  if (period === 'custom' && startDate && endDate) {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }
  return fetchWithAuth(url);
} 