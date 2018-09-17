// const winston = require('winston')

// const logger = winston.loggers.add('development', {
//   console: {
//     level: 'silly',
//     colorize: 'true',
//     label: 'category one'
//   },
//   file: {
//     filename: '../info.log',
//     level: 'warn'
//   }
// })

const { createLogger, format, transports } = require('winston')
const { combine, timestamp, label, printf } = format
 
const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
})
 
const logger = createLogger({
  format: combine(
    label({ label: 'development' }),
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console()]
})

module.exports = logger

