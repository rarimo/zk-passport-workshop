import { ClaimableToken__factory } from '../types/contracts'
import { JsonRpcProvider } from 'ethers'

const provider = new JsonRpcProvider('https://l2.rarimo.com')
const contract = ClaimableToken__factory.connect('0xE2746BEfd25A77B95efdB34e8803D1d3942A7881', provider)

export function getEventId (address: string) {
  return contract.getEventId(address)
}

export function getEventData () {
  return contract.getEventData()
}
