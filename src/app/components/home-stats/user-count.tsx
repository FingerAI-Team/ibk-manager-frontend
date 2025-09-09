import { Card, CardContent, Typography } from "@mui/material"
import dayjs, { Dayjs } from 'dayjs'

interface UserCountProps {
  selectedDate: dayjs.Dayjs;
  count: number;
  diffPercent: number;
}

export function UserCount({ selectedDate, count, diffPercent }: UserCountProps) {
  const isYesterday = selectedDate.isSame(dayjs().subtract(1, 'day'), 'day')

  return (
    <Card className="stats-card">
      <CardContent className="stats-card-content">
        <Typography variant="h6" gutterBottom>
          {isYesterday ? '전일' : selectedDate.format('MM/DD')} 사용자 수
        </Typography>
        <Typography variant="h4" className="stats-value">
          {(count ?? 0).toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="diff-text">
          이전 영업일 대비 {diffPercent >= 0 ? '+' : ''}{diffPercent ?? 0}%
        </Typography>
      </CardContent>
    </Card>
  )
} 