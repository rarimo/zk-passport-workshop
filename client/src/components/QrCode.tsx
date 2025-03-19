import useWebSocket, { WebSocketMessageType } from '../hooks/websocket'
import QRCode from 'react-qr-code'
import { Card } from 'primereact/card'
import { useAccount } from 'wagmi'
import { ProgressBar } from 'primereact/progressbar'
import { Message } from 'primereact/message'
import { Button } from 'primereact/button'
import { useContract } from '../hooks/contract'
import { Groth16VerifierHelper } from '../types/contracts/ClaimableToken'
import { Groth16Proof } from 'snarkjs'
import { hexlify, randomBytes } from 'ethers'

function formatProof(
	data: Groth16Proof
): Groth16VerifierHelper.ProofPointsStruct {
	return {
		a: [data.pi_a[0], data.pi_a[1]],
		b: [
			[data.pi_b[0][1], data.pi_b[0][0]],
			[data.pi_b[1][1], data.pi_b[1][0]],
		],
		c: [data.pi_c[0], data.pi_c[1]],
	}
}

export default function QrCode({ isClaimed }: { isClaimed: boolean }) {
	const { address } = useAccount()
	const { sessionId, status, proof } = useWebSocket(address)
	const { claim } = useContract()

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
					<p>{String(proof)}</p>
					{status === WebSocketMessageType.PROOF_SAVED && (
						<Button
							onClick={async () => {
								await claim?.(
									hexlify(randomBytes(32)),
									BigInt('0x303030303030'),
									address as string,
									{
										nullifier: hexlify(randomBytes(32)),
										identityCreationTimestamp: 0n,
									},
									{
										a: ['0x01', '0x02'],
										b: [
											['0x01', '0x02'],
											['0x01', '0x02'],
										],
										c: ['0x01', '0x02'],
									} as unknown as Groth16VerifierHelper.ProofPointsStruct
								)
							}}
						>
							Claim reward
						</Button>
					)}
				</div>
			</Card>
		)
	}

	return (
		<Card title="Scan the QR Code" className="p-shadow-2 p-p-4">
			<div className="flex flex-col items-center gap-4">
				<QRCode
					value={`${import.meta.env.VITE_API_URL}/api/proof-params/${address}`}
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
