'use client';

import { Card, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, Button, Avatar } from "@mui/material"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Download } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import { useState, useEffect } from 'react'
import { getUserRankingData } from '@/app/api/chat-analytics';
import type { UserRankingData } from '@/app/api/chat-analytics/types';
import { exportUserRankingToExcel } from '@/utils/excel';

export function UserRanking() {
  const [period, setPeriod] = useState('daily');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [displayCount, setDisplayCount] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [media, setMedia] = useState<string>('all');
  const [chartData, setChartData] = useState<UserRankingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // custom 기간이고 날짜가 선택되지 않은 경우는 성공으로 처리
      if (period === 'custom' && (!startDate || !endDate)) {
        setApiSuccess(true);
        setChartData([]);
        setIsLoading(false);
        return;
      }
      
      const response = await getUserRankingData(
        period, 
        displayCount, 
        sortOrder,
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
      console.error('Failed to fetch user ranking data:', error);
      setApiSuccess(false);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, displayCount, sortOrder, startDate, endDate, media]);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    if (value !== 'custom') {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const handleBarClick = (data: any) => {
    // 데이터가 비어있거나 userName이 없는 경우 무시
    if (!data || !data.userName) {
      return;
    }
    
    const userName = data.userName;
    
    // 클립보드 API 지원 여부 확인
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(userName)
        .then(() => {
          alert(`사용자 이름이 복사되었습니다.`);
        })
        .catch(err => {
          console.error('클립보드 복사 실패:', err);
          fallbackCopyTextToClipboard(userName);
        });
    } else {
      // 클립보드 API를 지원하지 않는 경우 대체 방법 사용
      fallbackCopyTextToClipboard(userName);
    }
  };
  
  // 대체 클립보드 복사 방법
  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // 화면 밖으로 위치시킴
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        alert(`사용자 이름이 복사되었습니다.`);
      } else {
        alert('클립보드 복사에 실패했습니다.');
      }
    } catch (err) {
      console.error('Fallback 클립보드 복사 실패:', err);
      alert('클립보드 복사에 실패했습니다.');
    }
    
    document.body.removeChild(textArea);
  };

  const handleExcelDownload = () => {
    if (chartData.length > 0) {
      exportUserRankingToExcel(
        chartData,
        period,
        displayCount,
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
          <Typography variant="h6">사용자별 대화 횟수 TOP {displayCount}</Typography>
          <div className="chart-controls">
            {period === 'custom' && (
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
                value={period}
                onChange={(e) => handlePeriodChange(e.target.value)}
              >
                <MenuItem value="daily">일간</MenuItem>
                <MenuItem value="weekly">주간</MenuItem>
                <MenuItem value="monthly">월간</MenuItem>
                <MenuItem value="custom">기간 지정</MenuItem>
              </Select>
            </FormControl>
            <FormControl className="form-control">
              <InputLabel>표시 개수</InputLabel>
              <Select 
                label="표시 개수" 
                value={displayCount}
                onChange={(e) => setDisplayCount(Number(e.target.value))}
              >
                <MenuItem value={5}>TOP 5</MenuItem>
                <MenuItem value={10}>TOP 10</MenuItem>
                <MenuItem value={20}>TOP 20</MenuItem>
                <MenuItem value={50}>TOP 50</MenuItem>
              </Select>
            </FormControl>
            <FormControl className="form-control">
              <InputLabel>정렬 순서</InputLabel>
              <Select 
                label="정렬 순서" 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              >
                <MenuItem value="desc">많은 순</MenuItem>
                <MenuItem value="asc">적은 순</MenuItem>
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
        <div className="chart-container chart-container-large">
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
              <BarChart 
                data={chartData.length === 0 ? [{ userName: '', chats: 0 }] : chartData}
                className="chart"
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis 
                  dataKey="userName"
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}회`, "대화 횟수"]}
                  wrapperClassName="chart-tooltip"
                  cursor={false}
                  allowEscapeViewBox={{ x: false, y: false }}
                />
                <Bar 
                  dataKey="chats" 
                  fill="var(--ibk-blue)"
                  name="대화 횟수"
                  onClick={handleBarClick}
                  style={{ cursor: 'pointer' }}
                  isAnimationActive={false}
                />
                {(chartData.length === 0 || chartData.every(item => item.chats === 0)) && (
                  <text 
                    x="50%" 
                    y="50%" 
                    textAnchor="middle" 
                    dominantBaseline="middle"
                    style={{ fontSize: '16px', fontWeight: 'normal' }}
                  >
                    {period === 'daily' ? '오늘 수집된 데이터가 없습니다' : 
                     period === 'custom' && (!startDate || !endDate) ? '시작일과 종료일을 모두 선택해주세요.' :
                     period === 'custom' ? '해당 기간에 사용자 활동 데이터가 없습니다' :
                     period === 'weekly' ? '이번 주 사용자 활동 데이터가 없습니다' : 
                     '이번 달 사용자 활동 데이터가 없습니다'}
                  </text>
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 