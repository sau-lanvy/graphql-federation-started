const winston = require('winston');

const loggerFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true })
);

export const logger = winston.createLogger({
  level: 'info',
  format: loggerFormat,
  defaultMeta: { service: 'reviews-service' },
  transports: [
    new winston.transports.Console({
        format: winston.format.simple(),
    })
  ],
});