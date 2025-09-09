'use client';

import { Card, CardContent, Typography } from "@mui/material"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useEffect } from 'react';
import { getDailyChartData } from '@/app/api/chat-analytics';
import type { DailyChartData } from '@/app/api/chat-analytics/types';

const COLORS = {
  chats: 'var(--ibk-blue)',
  users: 'var(--success-green)'
}

export function DailyChart() {
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(13, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [chartData, setChartData] = useState<DailyChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getDailyChartData(
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      );
      if (response.success) {
        setChartData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch daily chart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const handleStartDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setStartDate(newValue);
    }
  };

  const handleEndDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setEndDate(newValue);
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="chart-header">
          <Typography variant="h6">날짜별 대화/사용자 수 변화</Typography>
          <div className="date-picker-group">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker 
                label="시작일" 
                value={startDate}
                onChange={handleStartDateChange}
                maxDate={endDate}
              />
              <DatePicker 
                label="종료일" 
                value={endDate}
                onChange={handleEndDateChange}
                minDate={startDate}
              />
            </LocalizationProvider>
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
                {startDate.format('YYYY.MM.DD')} ~ {endDate.format('YYYY.MM.DD')} 기간에
                <br />
                수집된 데이터가 없습니다
              </Typography>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} className="chart">
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => dayjs(value).format('MM/DD')}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}${name === "users" ? "명" : "회"}`, 
                    name === "users" ? "사용자 수" : "대화 수"
                  ]}
                  labelFormatter={(label) => dayjs(label).format('YYYY-MM-DD')}
                  wrapperClassName="chart-tooltip"
                />
                <Line 
                  type="monotone" 
                  dataKey="chats" 
                  stroke={COLORS.chats} 
                  name="chats" 
                  dot={false} 
                  strokeWidth={2} 
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke={COLORS.users} 
                  name="users" 
                  dot={false} 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 