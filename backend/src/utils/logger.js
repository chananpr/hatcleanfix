const isDev = process.env.NODE_ENV === 'development'

const logger = {
  info: (...args) => console.log(`[INFO]`, ...args),
  error: (...args) => console.error(`[ERROR]`, ...args),
  warn: (...args) => console.warn(`[WARN]`, ...args),
  debug: (...args) => isDev && console.log(`[DEBUG]`, ...args),
}

module.exports = logger
