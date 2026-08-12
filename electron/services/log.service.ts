import log from 'electron-log'
import { PATHS } from './paths.service'

log.transports.file.resolvePathFn = () => PATHS.logFile
log.transports.console.level = 'info'
log.transports.file.level = 'info'

export const logger = log

// Mask sensitive data in logs
export function safeLog(message: string, ...args: any[]) {
  const safeArgs = args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      const copy = { ...arg }
      if (copy.password) copy.password = '[REDACTED]'
      if (copy.hash) copy.hash = '[REDACTED]'
      if (copy.licenseKey) copy.licenseKey = '[REDACTED]'
      return copy
    }
    return arg
  })
  logger.info(message, ...safeArgs)
}

export function logError(message: string, err?: any) {
  logger.error(`[ERROR] ${message}`, err)
}
