'use client';

import { Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, Button, Avatar } from "@mui/material"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Download } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useEffect } from 'react';
import { getHourlyChartData } from '@/app/api/chat-analytics';
import type { HourlyChartData } from '@/app/api/chat-analytics/types';
import { exportHourlyChartToExcel } from '@/utils/excel';

export function HourlyChart() {
  const [dateType, setDateType] = useState('today');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [media, setMedia] = useState<string>('all');
  const [chartData, setChartData] = useState<HourlyChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // custom 기간이고 날짜가 선택되지 않은 경우는 성공으로 처리
      if (dateType === 'custom' && (!startDate || !endDate)) {
        setApiSuccess(true);
        setChartData([]);
        setIsLoading(false);
        return;
      }
      
      const response = await getHourlyChartData(
        dateType,
        startDate?.format('YYYY-MM-DD'),
        endDate?.format('YYYY-MM-DD'),
        media === 'all' ? undefined : media
      );
      
      setApiSuccess(response.success);
      if (response.success) {
        setChartData(response.data.data);
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error('Failed to fetch hourly chart data:', error);
      setApiSuccess(false);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateType, startDate, endDate, media]);

  const handleDateTypeChange = (value: string) => {
    setDateType(value);
    if (value !== 'custom') {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleExcelDownload = () => {
    if (chartData.length > 0) {
      exportHourlyChartToExcel(
        chartData,
        dateType,
        startDate?.format('YYYY-MM-DD'),
        endDate?.format('YYYY-MM-DD'),
        media === 'all' ? undefined : media
      );
    }
  };

  return (
    <Card>
      <CardContent>
        <div className="chart-header">
          <Typography variant="h6">시간대별 대화량</Typography>
          <div className="chart-controls">
            {dateType === 'custom' && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="date-picker-group">
                  <DatePicker 
                    label="시작일" 
                    value={startDate}
                    onChange={setStartDate}
                    maxDate={endDate || undefined}
                  />
                  <DatePicker 
                    label="종료일" 
                    value={endDate}
                    onChange={setEndDate}
                    minDate={startDate || undefined}
                  />
                </div>
              </LocalizationProvider>
            )}
            <FormControl className="form-control">
              <InputLabel>기간</InputLabel>
              <Select 
                label="기간" 
                value={dateType}
                onChange={(e) => handleDateTypeChange(e.target.value)}
              >
                <MenuItem value="today">오늘</MenuItem>
                <MenuItem value="yesterday">어제</MenuItem>
                <MenuItem value="thisWeek">이번주</MenuItem>
                <MenuItem value="thisMonth">한달</MenuItem>
                <MenuItem value="custom">기간 지정</MenuItem>
              </Select>
            </FormControl>
            <FormControl className="form-control">
              <InputLabel>매체 구분</InputLabel>
              <Select 
                label="매체 구분" 
                value={media}
                onChange={(e) => setMedia(e.target.value)}
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
          ) : !apiSuccess ? (
            <div className="empty-container">
              <Typography>
                데이터 조회에 실패했습니다.
              </Typography>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.length === 0 ? [{ hour: '00', chats: 0 }] : chartData} className="chart">
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(value) => `${value}시`}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}회`, "대화 수"]}
                  labelFormatter={(label) => `${label}시`}
                  wrapperClassName="chart-tooltip"
                  cursor={false}
                  allowEscapeViewBox={{ x: false, y: false }}
                />
                <Bar 
                  dataKey="chats" 
                  fill="var(--ibk-blue)" 
                  name="대화 수"
                  isAnimationActive={false}
                />
                <text 
                    x="50%" 
                    y="50%" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    style={{ fontSize: '16px', fontWeight: 'normal' }}
                  >
                  {dateType === 'custom' && (!startDate || !endDate)
                    ? '시작일과 종료일을 모두 선택해주세요.'
                    : dateType === 'custom' && chartData.every(item => item.chats === 0)
                      ? `해당 기간에 수집된 데이터가 없습니다`
                      : dateType === 'yesterday' && chartData.every(item => item.chats === 0)
                        ? '어제 수집된 데이터가 없습니다'
                        : dateType === 'thisWeek' && chartData.every(item => item.chats === 0)
                          ? '이번 주 수집된 데이터가 없습니다'
                          : dateType === 'today' && chartData.every(item => item.chats === 0)
                            ? '오늘 수집된 데이터가 없습니다'
                            : dateType === 'thisMonth' && chartData.every(item => item.chats === 0)
                              ? '이번 달 수집된 데이터가 없습니다'
                              : ''
                  }
                </text>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 