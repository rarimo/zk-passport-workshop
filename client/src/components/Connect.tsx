import { Connector, useChainId, useConnect } from 'wagmi'
import { Button } from 'primereact/button'
import { ButtonGroup } from 'primereact/buttongroup'
import { useEffect, useState } from 'react'

export function Connect() {
	const chainId = useChainId()
	const { connectors, connect } = useConnect()

	return (
		<div className="flex flex-col gap-10">
			<h2 className="text-xl font-semibold text-center">Connect your wallet</h2>
			<div className="buttons p-d-flex p-flex-wrap p-gap-2 gap-2 p-justify-center">
				<ButtonGroup>
					{connectors.map((connector) => (
						<ConnectorButton
							key={connector.uid}
							connector={connector}
							onClick={() => connect({ connector, chainId })}
						/>
					))}
				</ButtonGroup>
			</div>
		</div>
	)
}

function ConnectorButton({
	connector,
	onClick,
}: {
	connector: Connector
	onClick: () => void
}) {
	const [ready, setReady] = useState(false)
	useEffect(() => {
		;(async () => {
			const provider = await connector.getProvider()
			setReady(!!provider)
		})()
	}, [connector])

	return (
		<Button
			label={connector.name}
			icon="pi pi-plug"
			disabled={!ready}
			onClick={onClick}
		/>
	)
}
