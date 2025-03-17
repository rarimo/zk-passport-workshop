import useWebSocket, { WebSocketMessageType } from '../hooks/websocket'
import QRCode from 'react-qr-code'
import { Card } from 'primereact/card'
import { useAccount } from 'wagmi'
import { ProgressBar } from 'primereact/progressbar'
import { Message } from 'primereact/message'

export default function QrCode({ isClaimed }: { isClaimed: boolean }) {
	const { address } = useAccount()
	const { sessionId, status } = useWebSocket(address)

	if (isClaimed || status === WebSocketMessageType.PROOF_SAVED) {
		return (
			<Card title="Proof Status" className="p-shadow-2 p-p-4">
				<div className="flex flex-col items-center gap-4">
					<svg
						className="ft-green-tick"
						xmlns="http://www.w3.org/2000/svg"
						height="100"
						width="100"
						viewBox="0 0 48 48"
						aria-hidden="true"
					>
						<circle className="circle" fill="#5bb543" cx="24" cy="24" r="22" />
						<path
							className="tick"
							fill="none"
							stroke="#FFF"
							stroke-width="6"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-miterlimit="10"
							d="M14 27l5.917 4.917L34 17"
						/>
					</svg>
					<Message severity="success" text="Proof is successfully generated" />
				</div>
			</Card>
		)
	}

	return (
		<Card title="Scan the QR Code" className="p-shadow-2 p-p-4">
			<div className="flex flex-col items-center gap-4">
				<QRCode
					value={`http://localhost:5000/api/proof-params/${address}`}
					size={150}
				/>
				<h3>{address || "You're not connected"}</h3>

				{sessionId !== address?.toLowerCase() && (
					<p>
						<strong>Service unavailable</strong>
					</p>
				)}

				{status === WebSocketMessageType.SET_SESSION_ID && (
					<p>
						<strong>Scan to generate proof</strong>
					</p>
				)}

				{[
					WebSocketMessageType.PROOF_GENERATING,
					WebSocketMessageType.PROOF_SAVING,
				].includes(status!) && (
					<>
						<ProgressBar
							color=""
							value={32}
							mode="indeterminate"
							className="w-3/5"
						/>
						<strong>
							{status === WebSocketMessageType.PROOF_GENERATING
								? 'Generating proof...'
								: 'Saving proof...'}
						</strong>
					</>
				)}

				{status === WebSocketMessageType.PROOF_ERROR && (
					<Message severity="error" text="Proof generating error" />
				)}
			</div>
		</Card>
	)
}
