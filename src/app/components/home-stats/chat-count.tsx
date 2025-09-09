import { Card, CardContent, Typography } from "@mui/material"
import dayjs from 'dayjs'

interface ChatCountProps {
  selectedDate: dayjs.Dayjs;
  count: number;
  diffPercent: number;
}

export function ChatCount({ selectedDate, count, diffPercent }: ChatCountProps) {
  const isYesterday = selectedDate.isSame(dayjs().subtract(1, 'day'), 'day')

  return (
    <Card className="stats-card">
      <CardContent className="stats-card-content">
        <Typography variant="h6" gutterBottom>
          {isYesterday ? '전일' : selectedDate.format('MM/DD')} 질의 개수
        </Typography>
        <Typography variant="h4" className="stats-value">
          {count?.toLocaleString() ?? '0'}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="diff-text">
          이전 영업일 대비 {diffPercent >= 0 ? '+' : ''}{diffPercent ?? 0}%
        </Typography>
      </CardContent>
    </Card>
  )
} 