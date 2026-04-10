import winston from 'winston';
import chalk from 'chalk';

// Ensure colors work on Ubuntu/Linux servers even if not a TTY
if (process.env.FORCE_COLOR === undefined) {
    process.env.FORCE_COLOR = '3'; // Force 256 colors
}

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
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, stack, errors, ...metadata }) => {
                let badge;
                switch (level) {
                    case 'error': badge = chalk.bgRed.white.bold(` ERROR `); break;
                    case 'warn':  badge = chalk.bgYellow.black.bold(` WARN `); break;
                    case 'info':  badge = chalk.bgCyan.black.bold(` INFO `); break;
                    case 'debug': badge = chalk.bgGray.white.bold(` DEBUG `); break;
                    default:      badge = chalk.bgWhite.black.bold(` ${level.toUpperCase()} `);
                }

                const ts = chalk.gray(`[${timestamp}]`);
                let msg = `${ts} ${badge} ${message}`;
                
                // Print specific metadata if present
                if (errors) {
                    msg += `\n${chalk.yellow('Validation Errors:')} ${JSON.stringify(errors, null, 2)}`;
                }

                if (stack) {
                    msg += `\n${chalk.red('Stack Trace:')}\n${chalk.dim(stack)}`;
                }

                // Print remaining metadata (excluding internal ones)
                const remaining = { ...metadata };
                delete remaining.event;
                delete remaining.path;
                delete remaining.method;
                delete remaining.ip;
                delete remaining.traceId;

                if (Object.keys(remaining).length > 0) {
                    msg += `\n${chalk.dim(JSON.stringify(remaining, null, 2))}`;
                }

                return msg;
            })
        ),
    }));
}

export default logger;
