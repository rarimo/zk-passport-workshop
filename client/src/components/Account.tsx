import { useAccount, useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import { Avatar } from 'primereact/avatar'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Tooltip } from 'primereact/tooltip'

export function Account() {
	const { address, connector } = useAccount()
	const { disconnect } = useDisconnect()
	const { data: ensName } = useEnsName({ address })
	const { data: ensAvatar } = useEnsAvatar({ name: ensName! })

	const formattedAddress = formatAddress(address)

	return (
		<Card title="Wallet Info" className="p-3">
			<div className="flex align-items-center gap-3">
				{ensAvatar ? (
					<Avatar image={ensAvatar} shape="circle" size="large" />
				) : (
					<Avatar
						label={formattedAddress?.charAt(0) || '?'}
						shape="circle"
						size="large"
					/>
				)}
				<div className="flex flex-col  items-start">
					<Tooltip target=".wallet-address" content={address || ''} />
					<p className="wallet-address font-bold text-lg">
						{ensName ? `${ensName} (${formattedAddress})` : formattedAddress}
					</p>
					<div className="text-sm text-gray-500">
						Connected to {connector?.name}
					</div>
				</div>
			</div>
			<Button
				label="Disconnect"
				icon="pi pi-sign-out"
				className="p-button-danger mt-3"
				onClick={() => disconnect()}
			/>
		</Card>
	)
}

function formatAddress(address?: string) {
	if (!address) return null
	return `${address.slice(0, 6)}…${address.slice(-4)}`
}
