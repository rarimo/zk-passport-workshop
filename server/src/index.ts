import express from 'express'
import { config } from './config'
import { logger } from './utils/logger'
import cors from 'cors'
import { loadProofs, saveProof } from '../db/helpers'
import WebSocket from 'ws'
import http from 'http'
import { WebSocketEvent } from './types'

const app = express()
app.use(cors())
app.use(express.json())

const wss = new WebSocket.Server({ noServer: true })

const clients = new Map()

wss.on('connection', (ws) => {
	let address: string | null = null

	ws.send(
		JSON.stringify({
			message: `You are connected to the WebSocket server!`,
		})
	)
	logger.info('New WebSocket connection, waiting for address...')

	ws.on('message', (message: string) => {
		try {
			const parsedMessage = JSON.parse(message)

			switch (parsedMessage.type) {
				case WebSocketEvent.SET_ADDRESS:
					if (parsedMessage.address) {
						address = parsedMessage.address.toLowerCase()
						clients.set(address, ws)
						logger.info(`New WebSocket connection from user@${address}`)

						ws.send(
							JSON.stringify({
								type: WebSocketEvent.SET_SESSION_ID,
								message: `You are connected! Your address is ${address}`,
								sessionId: address,
							})
						)
					}
					break

				default:
					logger.info(`Unknown message type: ${message}`)
					break
			}
		} catch (err) {
			logger.error('Error parsing message:', err)
		}
	})

	ws.on('close', () => {
		if (address) {
			clients.delete(address)
		}
		logger.info(`User with address ${address} has disconnected`)
	})
})

const server = http.createServer(app)

app.get('/api/proof-params/:id', (req, res) => {
	const { id: _id } = req.params
	const id = _id.toLowerCase().trim()

	if (!id) {
		return res.status(400).json({
			errors: [
				{
					title: 'Invalid Data',
					detail: 'id is required',
				},
			],
		})
	}

	const ws = clients.get(id)

	if (ws) {
		ws.send(
			JSON.stringify({
				type: WebSocketEvent.PROOF_GENERATING,
				message: `Your proof with ID ${id} is generating...`,
			})
		)
	} else {
		logger.info(`User with address ${id} not connected via WebSocket`)
	}

	res.json({
		data: {
			id,
			type: 'get_proof_params',
			attributes: {
				birth_date_lower_bound: '0x303030303030',
				birth_date_upper_bound: '0x303730333133',
				// TODO: Replace with the actual ngrok URL that maps to the
				// POST endpoint with the corresponding ID (EVM address)
				callback_url: `${config.API_URL}/api/proofs/${id}`,
				citizenship_mask: '0x554B52',
				event_data:
					'0x2c53003793370f2bdb1f8e1fe5d1dca45ab435f8cce48da8371f42d9c96d60',
				event_id: '12345678900987654321',
				expiration_date_lower_bound: '0x303030303030',
				expiration_date_upper_bound: '0x303030303030',
				identity_counter: 0,
				identity_counter_lower_bound: 0,
				identity_counter_upper_bound: 0,
				selector: '32801',
				timestamp_lower_bound: '0',
				timestamp_upper_bound: '0',
			},
		},
		included: [],
	})
})

app.post('/api/proofs/:id', (req, res) => {
	const { id: _id } = req.params
	const id = _id.toLowerCase().trim()

	if (!id) {
		return res.status(400).json({
			errors: [
				{
					title: 'Invalid Data',
					detail: 'id is required',
				},
			],
		})
	}

	const ws = clients.get(id)

	if (ws) {
		ws.send(
			JSON.stringify({
				type: WebSocketEvent.PROOF_SAVING,
				message: `Your proof with ID ${id} is generating...`,
			})
		)
	} else {
		logger.info(`User with address ${id} not connected via WebSocket`)
	}

	const proofs = loadProofs()

	const { data } = req.body
	console.log(data, data)

	if (!data || !data.attributes.proof) {
		if (ws) {
			// fake delay to show process status on client
			setTimeout(() => {
				ws.send(
					JSON.stringify({
						type: WebSocketEvent.PROOF_ERROR,
						message: `Error generation proof`,
					})
				)
			}, 2_000)
		} else {
			logger.info(`User with address ${id} not connected via WebSocket`)
		}
		return res.status(400).json({
			errors: [
				{
					title: 'Invalid Data',
					detail:
						'Proof data is required in the attributes of the data object.',
				},
			],
		})
	}

	if (proofs[id]) {
		if (ws) {
			// fake delay to show process status on client
			setTimeout(() => {
				ws.send(
					JSON.stringify({
						type: WebSocketEvent.PROOF_ERROR,
						message: `Error generation proof`,
					})
				)
			}, 2_000)
		} else {
			logger.info(`User with address ${id} not connected via WebSocket`)
		}
		return res.status(400).json({
			errors: [
				{
					title: 'Conflict',
					detail: 'Proof with this ID already exists.',
				},
			],
		})
	}

	proofs[id] = {
		id,
		date: new Date().getTime(),
		proof: data.attributes.proof,
	}

	saveProof(proofs)

	if (ws) {
		// fake delay to show process status on client
		setTimeout(() => {
			ws.send(
				JSON.stringify({
					type: WebSocketEvent.PROOF_SAVED,
					message: `Your proof with ID ${id} has been successfully saved!`,
				})
			)
		}, 5_000)
	} else {
		logger.info(`User with address ${id} not connected via WebSocket`)
	}

	res.status(201).json({})
})

app.get('/api/proofs/:id', (req, res) => {
	const { id } = req.params
	const proofs = loadProofs()

	const proof = proofs[id]

	if (!proof) {
		return res.status(404).json({
			errors: [
				{
					title: 'Not Found',
					detail: `Proof with ID ${id} not found.`,
				},
			],
		})
	}

	res.json({
		data: {
			id,
			type: 'proof',
			attributes: {
				proof,
			},
		},
	})
})

server.on('upgrade', (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, (ws) => {
		wss.emit('connection', ws, request)
	})
})

server.listen(config.PORT, () => {
	logger.info(`Server started at ${config.PORT}`)
})
