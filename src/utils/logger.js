import winston from 'winston';
import chalk from 'chalk';

const isProd = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, ...metadata }) => {
                let colorFunc;
                switch (level) {
                    case 'error': colorFunc = chalk.bold.red; break;
                    case 'warn': colorFunc = chalk.yellow; break;
                    case 'info': colorFunc = chalk.cyan; break;
                    case 'debug': colorFunc = chalk.gray; break;
                    default: colorFunc = chalk.white;
                }

                let msg = `${chalk.gray(`[${timestamp}]`)} ${colorFunc(level.toUpperCase().padEnd(5))}: ${message}`;
                
                if (Object.keys(metadata).length && metadata.event !== 'api_request') {
                    msg += `\n${chalk.gray(JSON.stringify(metadata, null, 2))}`;
                }
                return msg;
            })
        ),
    }));
}

export default logger;
