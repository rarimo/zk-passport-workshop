import { useAccount } from 'wagmi'

import { Connect } from './Connect'
import { Account } from './Account'

export function ConnectWallet() {
	const { isConnected } = useAccount()
	return (
		<div className="container">{isConnected ? <Account /> : <Connect />}</div>
	)
}
