import fs from 'fs';
import path from 'path';

// 로그 타입 정의
export interface QAMappingLog {
  timestamp: string;
  chatId: string;
  userId: string;
  question: string;
  answer: string;
  isStock: boolean;
  mappingStatus: 'success' | 'failed' | 'partial';
  mappingDetails?: {
    matchedKeywords: string[];
    confidence: number;
    source: string;
  };
  processingTime: number; // ms
}

export interface ConvLogData {
  timestamp: string;
  chatId: string;
  userId: string;
  question: string;
  answer: string;
  isStock: boolean;
  requestParams: {
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
    filters?: any;
  };
  responseMetadata: {
    totalCount: number;
    currentPage: number;
    hasMore: boolean;
  };
}

// 로그 디렉토리 설정
const LOG_DIR = path.join(process.cwd(), 'logs');
const QA_MAPPING_LOG_FILE = path.join(LOG_DIR, 'qa-mapping.log');
const CONV_LOG_FILE = path.join(LOG_DIR, 'conv-log.log');

// 로그 디렉토리 생성
function ensureLogDirectory() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

// 로그 포맷터
function formatLogEntry(data: any): string {
  return JSON.stringify({
    ...data,
    timestamp: new Date().toISOString()
  }) + '\n';
}

// QA 매핑 로그 기록
export function logQAMapping(data: Omit<QAMappingLog, 'timestamp'>) {
  try {
    ensureLogDirectory();
    
    const logEntry: QAMappingLog = {
      ...data,
      timestamp: new Date().toISOString()
    };
    
    const logLine = formatLogEntry(logEntry);
    fs.appendFileSync(QA_MAPPING_LOG_FILE, logLine);
    
    console.log(`📝 QA 매핑 로그 기록: ${data.chatId} - ${data.mappingStatus}`);
  } catch (error) {
    console.error('❌ QA 매핑 로그 기록 실패:', error);
  }
}

// 대화 로그 기록
export function logConvData(data: Omit<ConvLogData, 'timestamp'>) {
  try {
    ensureLogDirectory();
    
    const logEntry: ConvLogData = {
      ...data,
      timestamp: new Date().toISOString()
    };
    
    const logLine = formatLogEntry(logEntry);
    fs.appendFileSync(CONV_LOG_FILE, logLine);
    
    console.log(`📝 대화 로그 기록: ${data.chatId} - ${data.userId}`);
  } catch (error) {
    console.error('❌ 대화 로그 기록 실패:', error);
  }
}

// 로그 파일 읽기 (분석용)
export function readQAMappingLogs(limit?: number): QAMappingLog[] {
  try {
    if (!fs.existsSync(QA_MAPPING_LOG_FILE)) {
      return [];
    }
    
    const content = fs.readFileSync(QA_MAPPING_LOG_FILE, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    let logs = lines.map(line => JSON.parse(line) as QAMappingLog);
    
    if (limit) {
      logs = logs.slice(-limit); // 최근 N개만
    }
    
    return logs;
  } catch (error) {
    console.error('❌ QA 매핑 로그 읽기 실패:', error);
    return [];
  }
}

export function readConvLogs(limit?: number): ConvLogData[] {
  try {
    if (!fs.existsSync(CONV_LOG_FILE)) {
      return [];
    }
    
    const content = fs.readFileSync(CONV_LOG_FILE, 'utf-8');
    const lines = content.trim().split('\n').filter(line => line.trim());
    
    let logs = lines.map(line => JSON.parse(line) as ConvLogData);
    
    if (limit) {
      logs = logs.slice(-limit); // 최근 N개만
    }
    
    return logs;
  } catch (error) {
    console.error('❌ 대화 로그 읽기 실패:', error);
    return [];
  }
}

// 로그 통계 생성
export function generateLogStats() {
  const qaLogs = readQAMappingLogs();
  const convLogs = readConvLogs();
  
  const stats = {
    qaMapping: {
      total: qaLogs.length,
      success: qaLogs.filter(log => log.mappingStatus === 'success').length,
      failed: qaLogs.filter(log => log.mappingStatus === 'failed').length,
      partial: qaLogs.filter(log => log.mappingStatus === 'partial').length,
      avgProcessingTime: qaLogs.length > 0 
        ? qaLogs.reduce((sum, log) => sum + log.processingTime, 0) / qaLogs.length 
        : 0
    },
    convLog: {
      total: convLogs.length,
      uniqueUsers: new Set(convLogs.map(log => log.userId)).size,
      stockQuestions: convLogs.filter(log => log.isStock).length,
      generalQuestions: convLogs.filter(log => !log.isStock).length
    },
    generatedAt: new Date().toISOString()
  };
  
  return stats;
}

// 로그 파일 정리 (오래된 로그 삭제)
export function cleanupOldLogs(daysToKeep: number = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    [QA_MAPPING_LOG_FILE, CONV_LOG_FILE].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        
        const filteredLines = lines.filter(line => {
          try {
            const logEntry = JSON.parse(line);
            const logDate = new Date(logEntry.timestamp);
            return logDate >= cutoffDate;
          } catch {
            return false;
          }
        });
        
        fs.writeFileSync(filePath, filteredLines.join('\n') + '\n');
        console.log(`🧹 ${path.basename(filePath)} 정리 완료: ${lines.length - filteredLines.length}개 로그 삭제`);
      }
    });
  } catch (error) {
    console.error('❌ 로그 정리 실패:', error);
  }
}
