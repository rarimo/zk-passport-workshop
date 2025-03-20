import { config } from '../config'
import { ClaimableToken__factory } from '../types/contracts'
import { JsonRpcProvider } from 'ethers'

const provider = new JsonRpcProvider('https://l2.rarimo.com')
const contract = ClaimableToken__factory.connect(
	config.CONTRACT_ADDRESS,
	provider
)

export function getEventId(address: string) {
	return contract.getEventId(address)
}

export function getEventData() {
	return contract.getEventData()
}
