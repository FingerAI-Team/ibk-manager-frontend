'use client';

import { Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, Button, Avatar } from "@mui/material"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, TooltipProps } from "recharts"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Download } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useEffect } from 'react';
import { getDailyChartData } from '@/app/api/chat-analytics';
import type { DailyChartData } from '@/app/api/chat-analytics/types';
import { exportDailyChartToExcel } from '@/utils/excel';

const COLORS = {
  chats: 'var(--ibk-blue)',
  users: '#ff4444'
}


export function DailyChart() {
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(13, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [media, setMedia] = useState<string>('all');
  const [chartData, setChartData] = useState<DailyChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getDailyChartData(
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD'),
        media === 'all' ? undefined : media
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
  }, [startDate, endDate, media]);

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

  const handleMediaChange = (value: string) => {
    setMedia(value);
  };

  const handleExcelDownload = () => {
    if (chartData.length > 0) {
      exportDailyChartToExcel(
        chartData,
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD'),
        media === 'all' ? undefined : media
      );
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="chart-header">
          <Typography variant="h6">날짜별 대화/사용자 수 변화</Typography>
          <div className="chart-controls">
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
            <FormControl className="form-control">
              <InputLabel>매체 구분</InputLabel>
              <Select 
                label="매체 구분" 
                value={media}
                onChange={(e) => handleMediaChange(e.target.value)}
              >
                <MenuItem value="all">전체</MenuItem>
                <MenuItem value="MTS">MTS</MenuItem>
                <MenuItem value="i-One Bank">i-One Bank</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={handleExcelDownload}
              disabled={chartData.length === 0}
              sx={{ 
                minWidth: '45px',
                height: '45px',
                padding: '8px',
                borderRadius: '6px',
                borderColor: '#d0d0d0',
                '&:hover': {
                  borderColor: '#a0a0a0',
                  backgroundColor: '#f8f8f8'
                }
              }}
              title="엑셀 다운로드"
            >
              <Avatar
                src="/excel.png"
                alt="Excel"
                sx={{ 
                  width: 28, 
                  height: 28,
                  backgroundColor: 'transparent'
                }}
              />
            </Button>
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
                  formatter={(value, name) => {
                    const isUsers = name === 'users';
                    return [`${value}${isUsers ? '명' : '회'}`, isUsers ? '사용자 수' : '대화 수'];
                  }}
                  labelFormatter={(label) => dayjs(label).format('YYYY-MM-DD')}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
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