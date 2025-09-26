import { Card, CardContent, Typography, CircularProgress } from "@mui/material"
import dayjs from 'dayjs'

interface ChatCountProps {
  selectedDate: dayjs.Dayjs;
  count: number;
  diffPercent: number;
  loading?: boolean;
}

export function ChatCount({ selectedDate, count, diffPercent, loading = false }: ChatCountProps) {
  const isYesterday = selectedDate.isSame(dayjs().subtract(1, 'day'), 'day')

  return (
    <Card className="stats-card">
      <CardContent className="stats-card-content">
        <Typography variant="h6" gutterBottom>
          {isYesterday ? '전일' : selectedDate.format('MM/DD')} 질의 개수
        </Typography>
        <Typography variant="h4" className="stats-value">
          {loading ? (
            <CircularProgress size={40} />
          ) : (
            count?.toLocaleString() ?? '0'
          )}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="diff-text">
          {loading ? '데이터 로딩 중...' : `이전 영업일 대비 ${diffPercent >= 0 ? '+' : ''}${diffPercent ?? 0}%`}
        </Typography>
      </CardContent>
    </Card>
  )
} 