import { DailyChart } from './daily-chart'
import { WeekdayChart } from './weekday-chart'
import { UserRanking } from './user-ranking'
import { HourlyChart } from './hourly-chart'
import './styles.css'

export function ChatAnalytics() {
  return (
    <div className="analytics-container">
      <DailyChart />
      <WeekdayChart />
      <HourlyChart />
      <UserRanking />
    </div>
  )
} 