import { useState, useEffect } from "react"
import { Card, CardContent, Typography } from "@mui/material"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';
import dayjs, { Dayjs } from 'dayjs';
import { getUserClickRanking } from '@/app/api/click-analytics';
import type { UserClickData } from '@/app/api/click-analytics/types';

const COLORS = {
  clicks: 'var(--ibk-blue)',
  chats: '#ff4444'
}

type SortKey = 'clicks' | 'chats';

export function UserRanking() {
  const [sortBy, setSortBy] = useState<SortKey>('clicks');
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [allData, setAllData] = useState<UserClickData[]>([]);
  const [displayData, setDisplayData] = useState<UserClickData[]>([]);
  const [clicksData, setClicksData] = useState<UserClickData[]>([]);
  const [chatsData, setChatsData] = useState<UserClickData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const transformChartData = (data: UserClickData[]) => {
    return data.slice(0, 10).map(item => ({
      ...item,
      clicks: -Math.abs(item.clicks)
    }));
  };

  // 동적 틱 생성 함수
  const generateTicks = (maxValue: number, isNegative: boolean = false) => {
    if (maxValue === 0) return [0];
    
    // 적절한 간격 계산 (5, 10, 20, 50, 100, 200, 500, 1000 등)
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
    let step = magnitude;
    
    if (maxValue / magnitude > 5) {
      step = magnitude * 2;
    } else if (maxValue / magnitude > 2) {
      step = magnitude;
    } else {
      step = magnitude / 2;
    }
    
    const ticks = [];
    const numTicks = Math.min(Math.ceil(maxValue / step) + 1, 8); // 최대 8개 틱
    
    for (let i = 0; i < numTicks; i++) {
      const value = i * step;
      if (isNegative) {
        ticks.push(-value);
      } else {
        ticks.push(value);
      }
    }
    
    return ticks.sort((a, b) => a - b);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getUserClickRanking(
        startDate.format('YYYY-MM-DD'),
        endDate.format('YYYY-MM-DD')
      );
      if (response.success) {
        setAllData(response.data.data);
        
        // 클릭 수 기준으로 정렬된 데이터 (왼쪽 차트용)
        const clicksSortedData = [...response.data.data]
          .sort((a, b) => b.clicks - a.clicks)
          .slice(0, 10)
          .map(item => ({
            ...item,
            clicks: -Math.abs(item.clicks)
          }));
        setClicksData(clicksSortedData);
        
        // 대화 수 기준으로 정렬된 데이터 (오른쪽 차트용)
        const chatsSortedData = [...response.data.data]
          .sort((a, b) => b.chats - a.chats)
          .slice(0, 10);
        setChatsData(chatsSortedData);
        
        // 기존 displayData는 클릭 수 기준으로 유지 (호환성)
        const sortedData = [...response.data.data].sort((a, b) => b.clicks - a.clicks);
        setDisplayData(transformChartData(sortedData));
      }
    } catch (error) {
      console.error('Failed to fetch user click ranking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const handleSort = (key: SortKey) => {
    const sortedData = [...allData].sort((a, b) => {
      if (key === 'clicks') {
        return b.clicks - a.clicks;
      } else {
        return b.chats - a.chats;
      }
    });
    setDisplayData(transformChartData(sortedData));
    setSortBy(key);
  };

  const formatTooltipValue = (value: ValueType, name: string) => {
    if (typeof value === 'number') {
      const label = name === "chats" ? "대화 수" : "클릭 수"
      return [Math.abs(value), label]
    }
    return [0, ""]
  }

  const calculateAxisConfig = (data: UserClickData[]) => {
    const maxClicks = Math.max(...data.map(d => Math.abs(d.clicks)));
    const maxChats = Math.max(...data.map(d => d.chats));
    
    // 픽셀당 값 비율을 맞추기 위한 계산
    const DIVISIONS = 4;
    const interval = Math.ceil(Math.max(maxClicks, maxChats) / DIVISIONS);

    // 왼쪽 영역 눈금 (실제 maxClicks까지만)
    const leftTicks = [];
    for (let i = Math.ceil(maxClicks / interval); i >= 0; i--) {
      leftTicks.push(-interval * i);
    }

    // 오른쪽 영역 눈금 (실제 maxChats까지만)
    const rightTicks = [];
    for (let i = 0; i <= Math.ceil(maxChats / interval); i++) {
      rightTicks.push(interval * i);
    }

    return {
      ticks: [...new Set([...leftTicks, ...rightTicks])].sort((a, b) => a - b),
      domain: [-maxClicks, maxChats] // 실제 데이터 범위 사용
    };
  };

  const axisConfig = calculateAxisConfig(allData);

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

  return (
    <Card>
      <CardContent>
        <div className="date-selector-area">
          <Typography variant="h6">📌 사용자 클릭 & 대화 횟수 비교 (TOP 10)</Typography>
          <div className="date-picker-group">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker 
                label="시작일" 
                value={startDate}
                onChange={(newValue) => newValue && setStartDate(newValue)}
                maxDate={endDate}
                className="MuiDatePicker-root" 
              />
              <DatePicker 
                label="종료일" 
                value={endDate}
                onChange={(newValue) => newValue && setEndDate(newValue)}
                minDate={startDate}
                className="MuiDatePicker-root" 
              />
            </LocalizationProvider>
          </div>
        </div>
        <div style={{ display: 'flex', width: '100%', gap: '0' }}>
          {/* 클릭 차트 (우측 정렬) */}
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={clicksData}
                layout="vertical"
                margin={{ top: 20, right: 10, left: 10, bottom: 40 }}
                syncId={undefined}
              >
                <XAxis 
                  type="number"
                  orientation="bottom"
                  tickFormatter={(value) => Math.abs(value).toString()}
                  domain={['dataMin', 0]}
                  ticks={clicksData.length > 0 ? generateTicks(Math.max(...clicksData.map(d => Math.abs(d.clicks))), true) : [0]}
                  label={{ 
                    value: '클릭 수', 
                    position: 'bottom',
                    offset: 15,
                    style: { textAnchor: 'middle' }
                  }}
                />
                <YAxis 
                  type="category"
                  dataKey="userName"
                  orientation="left"
                  hide
                />
                <Bar
                  dataKey="clicks"
                  fill={COLORS.clicks}
                  name="클릭 수"
                  onClick={handleBarClick}
                  style={{ cursor: 'pointer' }}
                  isAnimationActive={false}
                  onMouseEnter={(data, index, event) => {
                    // 호버 효과는 제거하되 클릭은 유지
                    event?.stopPropagation();
                  }}
                />
                <Tooltip 
                  formatter={(value) => Math.abs(Number(value)) + '회'} 
                  cursor={false}
                  allowEscapeViewBox={{ x: false, y: false }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 대화 차트 (좌측 정렬) */}
          <div style={{ flex: 1 }}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chatsData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
                syncId={undefined}
              >
                <XAxis 
                  type="number"
                  orientation="bottom"
                  domain={[0, 'dataMax']}
                  ticks={chatsData.length > 0 ? generateTicks(Math.max(...chatsData.map(d => d.chats)), false) : [0]}
                  label={{ 
                    value: '대화 수', 
                    position: 'bottom',
                    offset: 15,
                    style: { textAnchor: 'middle' }
                  }}
                />
                <YAxis 
                  type="category"
                  dataKey="userName"
                  hide
                />
                <Bar
                  dataKey="chats"
                  fill={COLORS.chats}
                  name="대화 수"
                  onClick={handleBarClick}
                  style={{ cursor: 'pointer' }}
                  isAnimationActive={false}
                  onMouseEnter={(data, index, event) => {
                    // 호버 효과는 제거하되 클릭은 유지
                    event?.stopPropagation();
                  }}
                />
                <Tooltip 
                  formatter={(value) => value + '회'} 
                  cursor={false}
                  allowEscapeViewBox={{ x: false, y: false }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 