import { useState, useRef, useEffect } from 'react'

// Enum for message types
export enum WebSocketMessageType {
	SET_ADDRESS = 'SET_ADDRESS',
	SET_SESSION_ID = 'SET_SESSION_ID',
	USER_MESSAGE = 'USER_MESSAGE',
	PROOF_SAVED = 'PROOF_SAVED',
	PROOF_SAVING = 'PROOF_SAVING',
	PROOF_GENERATING = 'PROOF_GENERATING',
	PROOF_ERROR = 'PROOF_ERROR',
	DEFAULT = 'DEFAULT',
}

function useWebSocket(address?: `0x${string}`) {
	const [sessionId, setSessionId] = useState('')
	const [status, setStatus] = useState<WebSocketMessageType | null>(null)
	const socketRef = useRef<WebSocket | null>(null)

	useEffect(() => {
		if (!address) return

		if (!socketRef.current) {
			const ws = new WebSocket('ws://localhost:5000')
			socketRef.current = ws

			ws.addEventListener('open', () => {
				console.log('Connected to WebSocket server')
				ws.send(
					JSON.stringify({ type: WebSocketMessageType.SET_ADDRESS, address })
				)
			})

			ws.addEventListener('message', (event) => {
				console.log('Message from server:', event.data)
				const parsedMessage = JSON.parse(event.data)

				switch (parsedMessage.type) {
					case WebSocketMessageType.SET_SESSION_ID: {
						const sessionId = parsedMessage.sessionId
						setSessionId(sessionId)
						console.log('Session ID (EVM Address) set to:', sessionId)
						setStatus(parsedMessage.type)
						break
					}
					case WebSocketMessageType.PROOF_SAVING:
					case WebSocketMessageType.PROOF_GENERATING:
					case WebSocketMessageType.PROOF_SAVED:
					case WebSocketMessageType.PROOF_ERROR: {
						console.log(parsedMessage)
						setStatus(parsedMessage.type)
						break
					}

					default:
						console.log('Unknown message type:', parsedMessage.type)
						break
				}
			})

			ws.addEventListener('close', () => {
				console.log('Disconnected from WebSocket server')
			})

			ws.addEventListener('error', (error) => {
				console.log('WebSocket error:', error)
			})
		}

		return () => {
			socketRef.current?.close()
			socketRef.current = null
		}
	}, [address])

	const sendMessage = (message: string) => {
		if (socketRef.current) {
			socketRef.current.send(
				JSON.stringify({
					type: WebSocketMessageType.USER_MESSAGE,
					message,
				})
			)
			console.log("You've just sent a message")
		}
	}

	return { sessionId, status, sendMessage }
}

export default useWebSocket
