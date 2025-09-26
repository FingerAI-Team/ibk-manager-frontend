import { Card, CardContent, Typography, CircularProgress } from "@mui/material"
import dayjs, { Dayjs } from 'dayjs'

interface PredictionCountProps {
  selectedDate: dayjs.Dayjs;
  predictionStats: {
    correct: number;
    incorrect: number;
    accuracy: number;
  };
  loading?: boolean;
}

export function PredictionCount({ selectedDate, predictionStats, loading = false }: PredictionCountProps) {
  const isYesterday = selectedDate.isSame(dayjs().subtract(1, 'day'), 'day')

  return (
    <Card className="stats-card">
      <CardContent className="stats-card-content" sx={{ padding: '16px 16px 16px' }}>
        <Typography variant="h6" gutterBottom className="stats-title">
          {isYesterday ? '전일' : selectedDate.format('MM/DD')} 예측 결과
        </Typography>
        {loading ? (
          <div style={{ 
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CircularProgress size={40} />
          </div>
        ) : (
          <>
            <div className="prediction-results">
              <div className="prediction-item">
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: "#2E7D32", 
                    fontWeight: "bold", 
                    fontSize: "2.5rem",
                    marginBottom: "0.5rem" 
                  }} 
                  className="prediction-item-text"
                >
                  O
                </Typography>
                <Typography variant="h4" color="#2E7D32" className="prediction-item-value">
                  {predictionStats?.correct ?? 0}
                </Typography>
              </div>
              <div className="prediction-item">
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: "#D32F2F", 
                    fontWeight: "bold", 
                    fontSize: "2.5rem",
                    marginBottom: "0.5rem" 
                  }} 
                  className="prediction-item-text"
                >
                  X
                </Typography>
                <Typography variant="h4" color="#D32F2F" className="prediction-item-value">
                  {predictionStats?.incorrect ?? 0}
                </Typography>
              </div>
            </div>
            <div style={{ marginTop: '0px', marginBottom: '30px' }}>
              <Typography variant="body2" color="text.secondary" className="accuracy-text" sx={{ margin: 0 }}>
                종목 관련 예측 비율: {predictionStats?.accuracy ?? 0}%
              </Typography>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
} 