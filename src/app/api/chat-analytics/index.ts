import { ApiResponse, DailyChartResponse, HourlyChartResponse, WeekdayChartResponse, UserRankingResponse } from './types';
import { fetchWithAuth } from '@/utils/fetch';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';  // API 서버 주소 추가
const BASE_URL = API_BASE_URL+'/chat-analytics';

// 일별 차트 데이터 조회
export async function getDailyChartData(startDate: string, endDate: string, media?: string): Promise<ApiResponse<DailyChartResponse>> {
  let url = `${BASE_URL}/daily?startDate=${startDate}&endDate=${endDate}`;
  if (media) {
    url += `&media=${media}`;
  }
  return fetchWithAuth(url);
}

// 시간대별 차트 데이터 조회
export async function getHourlyChartData(dateType: string, startDate?: string, endDate?: string, media?: string): Promise<ApiResponse<HourlyChartResponse>> {
  let url = `${BASE_URL}/hourly?dateType=${dateType}`;
  if (dateType === 'custom' && startDate && endDate) {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }
  if (media) {
    url += `&media=${media}`;
  }
  return fetchWithAuth(url);
}

// 요일별 차트 데이터 조회
export async function getWeekdayChartData(year: number, month: number, media?: string): Promise<ApiResponse<WeekdayChartResponse>> {
  let url = `${BASE_URL}/weekday?year=${year}&month=${month}`;
  if (media) {
    url += `&media=${media}`;
  }
  return fetchWithAuth(url);
}

// 사용자 랭킹 데이터 조회
export async function getUserRankingData(
  period: string,
  limit: number,
  sortOrder: 'asc' | 'desc',
  startDate?: string,
  endDate?: string,
  media?: string
): Promise<ApiResponse<UserRankingResponse>> {
  let url = `${BASE_URL}/ranking?period=${period}&limit=${limit}&sortOrder=${sortOrder}`;
  if (period === 'custom' && startDate && endDate) {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }
  if (media) {
    url += `&media=${media}`;
  }
  return fetchWithAuth(url);
} 