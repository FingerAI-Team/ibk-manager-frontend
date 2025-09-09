'use client';

import { Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useState, useEffect } from 'react'
import { getWeekdayChartData } from '@/app/api/chat-analytics';
import type { WeekdayChartData } from '@/app/api/chat-analytics/types';

const COLORS = {
  chats: 'var(--ibk-blue)',
  users: 'var(--success-green)'
}

export function WeekdayChart() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [chartData, setChartData] = useState<WeekdayChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 연도 선택 옵션 생성 (현재 연도 포함 최근 5년)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getWeekdayChartData(selectedYear, selectedMonth);
      if (response.success) {
        setChartData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch weekday chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  return (
    <Card>
      <CardContent>
        <div className="chart-header">
          <Typography variant="h6">요일별 대화/사용자 수</Typography>
          <div className="chart-controls">
            <FormControl className="form-control">
              <InputLabel>연도</InputLabel>
              <Select 
                label="연도" 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {yearOptions.map(year => (
                  <MenuItem key={year} value={year}>{year}년</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl className="form-control">
              <InputLabel>월</InputLabel>
              <Select 
                label="월" 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{i + 1}월</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
        <div className="chart-container">
          {isLoading ? (
            <div className="loading-container">
              <Typography>데이터를 불러오는 중...</Typography>
            </div>
          ) : chartData.length === 0 ? (
            <div className="empty-container">
              <Typography>
                {selectedYear}년 {selectedMonth}월에 수집된 데이터가 없습니다
              </Typography>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} className="chart">
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'chats') {
                      return [`${value}회`, '대화 수'];
                    } else if (name === 'users') {
                      return [`${value}명`, '사용자 수'];
                    }
                    return [value, name];
                  }}
                  labelFormatter={(label) => `${label}`}
                  wrapperClassName="chart-tooltip"
                />
                <Bar 
                  dataKey="chats" 
                  fill={COLORS.chats}
                />
                <Bar 
                  dataKey="users" 
                  fill={COLORS.users}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 