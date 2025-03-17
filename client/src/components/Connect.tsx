import * as React from 'react'
import { Connector, useChainId, useConnect } from 'wagmi'
import { Button } from 'primereact/button'
import { ButtonGroup } from 'primereact/buttongroup'

export function Connect() {
	const chainId = useChainId()
	const { connectors, connect } = useConnect()

	return (
		<div className="buttons p-d-flex p-flex-wrap p-gap-2 gap-2">
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
	)
}

function ConnectorButton({
	connector,
	onClick,
}: {
	connector: Connector
	onClick: () => void
}) {
	const [ready, setReady] = React.useState(false)

	React.useEffect(() => {
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
