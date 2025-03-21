import 'dotenv/config'

export const config = {
	PORT: process.env.PORT,
	LOG_LEVEL: process.env.LOG_LEVEL || 'info',
	API_URL: process.env.API_URL,
	CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS as string,
}
