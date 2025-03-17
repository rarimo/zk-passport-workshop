import chalk from 'chalk'
import { createLogger, format, transports } from 'winston'
import { config } from '../config'

export const logger = createLogger({
	level: config.LOG_LEVEL,
	transports: [new transports.Console()],
	format: format.combine(
		format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		format.printf(
			({ timestamp, level, message }) =>
				`${timestamp} ${formatLevel(level)}: ${message}`
		)
	),
})

function formatLevel(level: string): string {
	const levelMsg = level.toUpperCase()
	switch (level) {
		case 'debug':
			return chalk.magenta(levelMsg)
		case 'info':
			return chalk.green(levelMsg)
		case 'warn':
			return chalk.yellow(levelMsg)
		case 'error':
			return chalk.red(levelMsg)
		default:
			return levelMsg
	}
}
