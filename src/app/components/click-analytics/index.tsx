import { UserRanking } from './user-ranking'
import { ClickRatioCharts } from './click-ratio-charts'
import './styles.css'

export function ClickAnalytics() {
  return (
    <div className="click-analytics-container">
      <UserRanking />
      <ClickRatioCharts />
    </div>
  )
} 