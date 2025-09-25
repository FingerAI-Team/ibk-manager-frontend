#!/usr/bin/env ts-node

import { 
  logQAMapping, 
  logConvData, 
  generateLogStats, 
  cleanupOldLogs,
  QAMappingLog,
  ConvLogData 
} from '../utils/logger';
import { LogAnalyzer } from './log-analyzer';

// 서버 로거 클래스
class ServerLogger {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private analyzer: LogAnalyzer;

  constructor() {
    this.analyzer = new LogAnalyzer();
  }

  // 주기적 로그 분석 실행
  startPeriodicAnalysis(intervalMinutes: number = 60) {
    if (this.isRunning) {
      console.log('⚠️ 이미 주기적 분석이 실행 중입니다.');
      return;
    }

    this.isRunning = true;
    console.log(`🔄 주기적 로그 분석 시작 (${intervalMinutes}분 간격)`);

    // 즉시 한 번 실행
    this.runAnalysis();

    // 주기적 실행
    this.intervalId = setInterval(() => {
      this.runAnalysis();
    }, intervalMinutes * 60 * 1000);
  }

  // 분석 실행
  private runAnalysis() {
    try {
      console.log(`\n🔍 로그 분석 실행: ${new Date().toLocaleString()}`);
      
      const stats = this.analyzer.runFullAnalysis();
      
      // 임계값 체크 및 알림
      this.checkThresholds(stats);
      
      // 오래된 로그 정리 (7일 이상)
      cleanupOldLogs(7);
      
    } catch (error) {
      console.error('❌ 로그 분석 중 오류:', error);
    }
  }

  // 임계값 체크 및 알림
  private checkThresholds(stats: any) {
    const alerts: string[] = [];

    // QA 매핑 성공률 체크
    if (stats.qaMapping.total > 0) {
      const successRate = stats.qaMapping.success / stats.qaMapping.total;
      if (successRate < 0.8) {
        alerts.push(`⚠️ QA 매핑 성공률이 낮습니다: ${(successRate * 100).toFixed(1)}%`);
      }
    }

    // 평균 처리시간 체크
    if (stats.qaMapping.avgProcessingTime > 1000) {
      alerts.push(`⚠️ 평균 처리시간이 느립니다: ${stats.qaMapping.avgProcessingTime.toFixed(2)}ms`);
    }

    // 실패율 체크
    if (stats.qaMapping.total > 0) {
      const failureRate = stats.qaMapping.failed / stats.qaMapping.total;
      if (failureRate > 0.2) {
        alerts.push(`⚠️ QA 매핑 실패율이 높습니다: ${(failureRate * 100).toFixed(1)}%`);
      }
    }

    if (alerts.length > 0) {
      console.log('\n🚨 알림:');
      alerts.forEach(alert => console.log(alert));
      
      // 실제 운영에서는 여기서 슬랙, 이메일, SMS 등으로 알림 발송
      this.sendAlert(alerts);
    } else {
      console.log('✅ 모든 지표가 정상 범위입니다.');
    }
  }

  // 알림 발송 (실제 구현에서는 외부 서비스 연동)
  private sendAlert(alerts: string[]) {
    // 예시: 슬랙 웹훅, 이메일, SMS 등
    console.log('📧 알림 발송 시뮬레이션:', alerts.join('; '));
  }

  // 주기적 분석 중지
  stopPeriodicAnalysis() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('⏹️ 주기적 로그 분석 중지');
  }

  // 실시간 모니터링 시작
  startRealtimeMonitoring() {
    console.log('👁️ 실시간 모니터링 시작');
    
    // 로그 파일 변경 감지 (간단한 폴링 방식)
    setInterval(() => {
      this.analyzer.loadLogs();
      const recentStats = generateLogStats();
      
      // 최근 5분간의 데이터만 체크
      const recentQALogs = this.analyzer['qaLogs'].filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return logTime > fiveMinutesAgo;
      });
      
      if (recentQALogs.length > 0) {
        const recentFailures = recentQALogs.filter(log => log.mappingStatus === 'failed');
        if (recentFailures.length > 0) {
          console.log(`🚨 최근 5분간 ${recentFailures.length}건의 QA 매핑 실패 발생`);
        }
      }
    }, 30000); // 30초마다 체크
  }

  // 서버 상태 리포트
  generateServerStatusReport() {
    const stats = generateLogStats();
    const uptime = process.uptime();
    
    const report = {
      server: {
        uptime: `${Math.floor(uptime / 3600)}시간 ${Math.floor((uptime % 3600) / 60)}분`,
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      },
      logs: stats,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n📊 서버 상태 리포트');
    console.log('='.repeat(50));
    console.log(`서버 가동시간: ${report.server.uptime}`);
    console.log(`메모리 사용량: ${(report.server.memory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`QA 매핑 총 건수: ${stats.qaMapping.total}`);
    console.log(`대화 로그 총 건수: ${stats.convLog.total}`);
    
    return report;
  }
}

// CLI 실행
if (require.main === module) {
  const logger = new ServerLogger();
  
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'start':
      const interval = parseInt(arg) || 60;
      logger.startPeriodicAnalysis(interval);
      break;
    case 'stop':
      logger.stopPeriodicAnalysis();
      break;
    case 'monitor':
      logger.startRealtimeMonitoring();
      break;
    case 'status':
      logger.generateServerStatusReport();
      break;
    case 'analyze':
      logger['runAnalysis']();
      break;
    default:
      console.log(`
사용법:
  npm run server-logger start [interval_minutes]  - 주기적 분석 시작
  npm run server-logger stop                      - 주기적 분석 중지
  npm run server-logger monitor                   - 실시간 모니터링 시작
  npm run server-logger status                    - 서버 상태 리포트
  npm run server-logger analyze                   - 즉시 분석 실행
      `);
  }
}

export { ServerLogger };
