import { useAccount } from 'wagmi'
import './App.css'
import { ConnectWallet } from './components/ConnectWallet'
import QrCode from './components/QrCode'
import { useContract } from './hooks/contract'
import { useEffect, useState } from 'react'

function App() {
	const { address, isConnected } = useAccount()
	const { checkIsClaimed } = useContract()
	const [isClaimed, setIsClaimed] = useState(false)

	useEffect(() => {
		if (!address) {
			setIsClaimed(false)
			return
		}

		const fetchClaimedStatus = async () => {
			const isClaimed = await checkIsClaimed(address)
			setIsClaimed(isClaimed)
		}

		if (address && isConnected) {
			fetchClaimedStatus()
		}
	}, [address, checkIsClaimed, isConnected])

	return (
		<div className="flex flex-col gap-4">
			<ConnectWallet />
			{address && isConnected && <QrCode isClaimed={isClaimed} />}
		</div>
	)
}

export default App
