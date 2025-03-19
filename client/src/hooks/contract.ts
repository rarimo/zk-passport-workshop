import { Config, Transport, useClient, useConnectorClient } from 'wagmi'
import { ClaimableToken__factory } from '../types/contracts'
import { useMemo } from 'react'
import {
	JsonRpcProvider,
	FallbackProvider,
	BrowserProvider,
	JsonRpcSigner,
} from 'ethers'
import { Client, Chain, Account } from 'viem'

export const useContract = () => {
	const signer = useEthersSigner()

	const contract = useMemo(() => {
		if (!signer) return null
		return ClaimableToken__factory.connect(
			import.meta.env.VITE_CONTRACT_ADDRESS ?? '',
			signer
		)
	}, [signer])

	return {
		checkIsClaimed: contract?.isClaimedByAddress,
		claim: contract?.claim,
	}
}

export function useEthersProvider({ chainId }: { chainId?: number } = {}) {
	const client = useClient<Config>({ chainId })
	return useMemo(
		() => (client ? clientToProvider(client) : undefined),
		[client]
	)
}

export function clientToSigner(client: Client<Transport, Chain, Account>) {
	const { account, chain, transport } = client
	const network = {
		chainId: chain.id,
		name: chain.name,
		ensAddress: chain.contracts?.ensRegistry?.address,
	}
	const provider = new BrowserProvider(transport, network)
	const signer = new JsonRpcSigner(provider, account.address)
	return signer
}

export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
	const { data: client } = useConnectorClient<Config>({ chainId })
	return useMemo(() => (client ? clientToSigner(client) : undefined), [client])
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
