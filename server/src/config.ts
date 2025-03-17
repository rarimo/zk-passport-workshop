import 'dotenv/config'

export const config = {
	PORT: process.env.PORT,
	LOG_LEVEL: process.env.LOG_LEVEL || 'info',
}
