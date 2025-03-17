import { Config, Transport, useClient } from 'wagmi'
import { ClaimableToken__factory } from '../types/contracts'
import { useMemo } from 'react'
import { JsonRpcProvider, FallbackProvider } from 'ethers'
import { Client, Chain } from 'viem'

export const useContract = () => {
	const provider = useEthersProvider()

	const contract = useMemo(() => {
		return ClaimableToken__factory.connect(
			import.meta.env.VITE_CONTRACT_ADDRESS ?? '',
			provider
		)
	}, [provider])

	return {
		checkIsClaimed: contract.isClaimedByAddress,
	}
}

export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
	const client = useClient<Config>({ chainId })
	return useMemo(
		() => (client ? clientToProvider(client) : undefined),
		[client]
	)
}

export function clientToProvider(client: Client<Transport, Chain>) {
	const { chain, transport } = client
	const network = {
		chainId: chain.id,
		name: chain.name,
		ensAddress: chain.contracts?.ensRegistry?.address,
	}
	if (transport.type === 'fallback') {
		const providers = (transport.transports as ReturnType<Transport>[]).map(
			({ value }) => new JsonRpcProvider(value?.url, network)
		)
		if (providers.length === 1) return providers[0]
		return new FallbackProvider(providers)
	}
	return new JsonRpcProvider(transport.url, network)
}
