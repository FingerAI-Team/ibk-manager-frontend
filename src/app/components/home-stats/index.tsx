import { DateSelector } from './date-selector'
import { ChatCount } from './chat-count'
import { UserCount } from './user-count'
import { ClickRatio } from './click-ratio'
import { PredictionCount } from './prediction-count'
import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { homeApi } from '@/app/api/home'
import { DailyStats } from '@/app/api/home/types'
import './styles.css'
import axios from 'axios'

export function HomeStats() {
  const [selectedDate, setSelectedDate] = useState(dayjs())
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 기본값 설정
  const defaultStats: DailyStats = {
    chatCount: 0,
    chatCountDiff: 0,
    userCount: 0,
    userCountDiff: 0,
    clickRatio: {
      click: { count: 0, ratio: 0 },
      nonClick: { count: 0, ratio: 0 }
    },
    predictionStats: {
      correct: 0,
      incorrect: 0,
      accuracy: 0
    }
  }

  useEffect(() => {
    const fetchDailyStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await homeApi.getDailyStats({
          date: selectedDate.format('YYYY-MM-DD')
        })
        setStats(response)
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.status === 404 
              ? 'API 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.' 
              : '통계 데이터를 불러오는데 실패했습니다.'
          )
        } else {
          setError('알 수 없는 오류가 발생했습니다.')
        }
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDailyStats()
  }, [selectedDate])

  return (
    <div className="home-stats-container">
      <div className="date-selector-wrapper">
        <DateSelector onDateChange={setSelectedDate} />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="stats-grid">
        <ChatCount 
          selectedDate={selectedDate}
          count={stats?.chatCount ?? defaultStats.chatCount}
          diffPercent={stats?.chatCountDiff ?? defaultStats.chatCountDiff}
          loading={loading}
        />
        <UserCount 
          selectedDate={selectedDate}
          count={stats?.userCount ?? defaultStats.userCount}
          diffPercent={stats?.userCountDiff ?? defaultStats.userCountDiff}
          loading={loading}
        />
        <ClickRatio 
          selectedDate={selectedDate}
          clickRatio={stats?.clickRatio ?? defaultStats.clickRatio}
          loading={loading}
        />
        <PredictionCount 
          selectedDate={selectedDate}
          predictionStats={stats?.predictionStats ?? defaultStats.predictionStats}
          loading={loading}
        />
      </div>
      
      <div className="data-collection-notice">
        * 데이터 수집은 매 정시 5분에 진행됩니다.
      </div>
    </div>
  )
} 