#!/usr/bin/env ts-node

import { 
  readQAMappingLogs, 
  readConvLogs, 
  generateLogStats, 
  cleanupOldLogs,
  QAMappingLog,
  ConvLogData 
} from '../utils/logger';
import fs from 'fs';
import path from 'path';

// 로그 분석기 클래스
class LogAnalyzer {
  private qaLogs: QAMappingLog[] = [];
  private convLogs: ConvLogData[] = [];

  constructor() {
    this.loadLogs();
  }

  // 로그 데이터 로드
  private loadLogs() {
    this.qaLogs = readQAMappingLogs();
    this.convLogs = readConvLogs();
    console.log(`📊 로그 데이터 로드 완료: QA ${this.qaLogs.length}개, Conv ${this.convLogs.length}개`);
  }

  // QA 매핑 성공률 분석
  analyzeQAMappingSuccess() {
    const total = this.qaLogs.length;
    if (total === 0) {
      console.log('📊 QA 매핑 로그가 없습니다.');
      return;
    }

    const success = this.qaLogs.filter(log => log.mappingStatus === 'success').length;
    const failed = this.qaLogs.filter(log => log.mappingStatus === 'failed').length;
    const partial = this.qaLogs.filter(log => log.mappingStatus === 'partial').length;

    console.log('\n📊 QA 매핑 성공률 분석');
    console.log('='.repeat(50));
    console.log(`전체 매핑 시도: ${total}개`);
    console.log(`성공: ${success}개 (${(success/total*100).toFixed(1)}%)`);
    console.log(`실패: ${failed}개 (${(failed/total*100).toFixed(1)}%)`);
    console.log(`부분 성공: ${partial}개 (${(partial/total*100).toFixed(1)}%)`);

    // 평균 처리 시간
    const avgTime = this.qaLogs.reduce((sum, log) => sum + log.processingTime, 0) / total;
    console.log(`평균 처리 시간: ${avgTime.toFixed(2)}ms`);
  }

  // 대화 로그 분석
  analyzeConvLogs() {
    const total = this.convLogs.length;
    if (total === 0) {
      console.log('📊 대화 로그가 없습니다.');
      return;
    }

    const uniqueUsers = new Set(this.convLogs.map(log => log.userId)).size;
    const stockQuestions = this.convLogs.filter(log => log.isStock).length;
    const generalQuestions = this.convLogs.filter(log => !log.isStock).length;

    console.log('\n📊 대화 로그 분석');
    console.log('='.repeat(50));
    console.log(`전체 대화: ${total}개`);
    console.log(`고유 사용자: ${uniqueUsers}명`);
    console.log(`종목 관련 질문: ${stockQuestions}개 (${(stockQuestions/total*100).toFixed(1)}%)`);
    console.log(`일반 질문: ${generalQuestions}개 (${(generalQuestions/total*100).toFixed(1)}%)`);

    // 시간대별 분석
    this.analyzeByTimeOfDay();
  }

  // 시간대별 분석
  private analyzeByTimeOfDay() {
    const hourlyStats: { [hour: number]: number } = {};
    
    this.convLogs.forEach(log => {
      const hour = new Date(log.timestamp).getHours();
      hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
    });

    console.log('\n⏰ 시간대별 대화 분포');
    console.log('-'.repeat(30));
    for (let hour = 0; hour < 24; hour++) {
      const count = hourlyStats[hour] || 0;
      const bar = '█'.repeat(Math.floor(count / 5));
      console.log(`${hour.toString().padStart(2, '0')}시: ${count.toString().padStart(3)} ${bar}`);
    }
  }

  // 실패한 QA 매핑 상세 분석
  analyzeFailedMappings() {
    const failedLogs = this.qaLogs.filter(log => log.mappingStatus === 'failed');
    
    if (failedLogs.length === 0) {
      console.log('\n✅ 실패한 QA 매핑이 없습니다.');
      return;
    }

    console.log('\n❌ 실패한 QA 매핑 분석');
    console.log('='.repeat(50));
    console.log(`실패 건수: ${failedLogs.length}개`);

    // 실패 원인별 분류
    const failureReasons: { [reason: string]: number } = {};
    failedLogs.forEach(log => {
      const reason = log.mappingDetails?.source || 'unknown';
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
    });

    console.log('\n실패 원인별 분포:');
    Object.entries(failureReasons)
      .sort(([,a], [,b]) => b - a)
      .forEach(([reason, count]) => {
        console.log(`  ${reason}: ${count}개`);
      });

    // 최근 실패 사례 5개 출력
    console.log('\n최근 실패 사례 (최대 5개):');
    failedLogs.slice(-5).forEach((log, index) => {
      console.log(`\n${index + 1}. ID: ${log.chatId}`);
      console.log(`   질문: ${log.question.substring(0, 50)}...`);
      console.log(`   시간: ${new Date(log.timestamp).toLocaleString()}`);
      console.log(`   처리시간: ${log.processingTime}ms`);
    });
  }

  // 성능 분석
  analyzePerformance() {
    if (this.qaLogs.length === 0) return;

    const processingTimes = this.qaLogs.map(log => log.processingTime);
    const sorted = processingTimes.sort((a, b) => a - b);
    
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p90 = sorted[Math.floor(sorted.length * 0.9)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];

    console.log('\n⚡ 성능 분석');
    console.log('='.repeat(50));
    console.log(`평균 처리시간: ${(processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length).toFixed(2)}ms`);
    console.log(`P50 (중간값): ${p50}ms`);
    console.log(`P90: ${p90}ms`);
    console.log(`P95: ${p95}ms`);
    console.log(`P99: ${p99}ms`);
    console.log(`최대값: ${Math.max(...processingTimes)}ms`);
    console.log(`최소값: ${Math.min(...processingTimes)}ms`);
  }

  // 리포트 생성
  generateReport() {
    const stats = generateLogStats();
    const reportPath = path.join(process.cwd(), 'logs', `report-${new Date().toISOString().split('T')[0]}.json`);
    
    fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2));
    console.log(`\n📄 리포트 생성 완료: ${reportPath}`);
    
    return stats;
  }

  // 전체 분석 실행
  runFullAnalysis() {
    console.log('🔍 로그 분석 시작...\n');
    
    this.analyzeQAMappingSuccess();
    this.analyzeConvLogs();
    this.analyzeFailedMappings();
    this.analyzePerformance();
    
    const stats = this.generateReport();
    
    console.log('\n✅ 로그 분석 완료!');
    return stats;
  }
}

// CLI 실행
if (require.main === module) {
  const analyzer = new LogAnalyzer();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'qa':
      analyzer.analyzeQAMappingSuccess();
      break;
    case 'conv':
      analyzer.analyzeConvLogs();
      break;
    case 'failed':
      analyzer.analyzeFailedMappings();
      break;
    case 'performance':
      analyzer.analyzePerformance();
      break;
    case 'cleanup':
      const days = parseInt(process.argv[3]) || 30;
      cleanupOldLogs(days);
      break;
    case 'report':
      analyzer.generateReport();
      break;
    default:
      analyzer.runFullAnalysis();
  }
}

export { LogAnalyzer };
