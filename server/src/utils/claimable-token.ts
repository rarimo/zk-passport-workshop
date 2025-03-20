import { ClaimableToken__factory } from '../types/contracts'
import { JsonRpcProvider } from 'ethers'

const provider = new JsonRpcProvider('https://l2.rarimo.com')
const contract = ClaimableToken__factory.connect(
	'0x69c94172f3E3Cb300e6b0f50A67181455650D150',
	provider
)

export function getEventId(address: string) {
	return contract.getEventId(address)
}

export function getEventData() {
	return contract.getEventData()
}
