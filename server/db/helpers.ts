import path from 'path'
import fs from 'fs'

const proofFilePath = path.join(__dirname, 'proofs.json')

export const loadProofs = () => {
	if (fs.existsSync(proofFilePath)) {
		const data = fs.readFileSync(proofFilePath).toString()
		return JSON.parse(data)
	}
	return {}
}

export const saveProof = (proofs: Record<string, any>) => {
	fs.writeFileSync(proofFilePath, JSON.stringify(proofs, null, 2))
}
