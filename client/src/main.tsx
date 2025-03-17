import { createRoot } from 'react-dom/client'
import { PrimeReactProvider } from 'primereact/api'
import App from './App.tsx'
import { injected, WagmiProvider } from 'wagmi'

import { http, createConfig } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { walletConnect, metaMask, safe } from 'wagmi/connectors'

const rarimo = defineChain({
	id: 7368,
	name: 'Base',
	nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
	rpcUrls: {
		default: {
			http: ['https://l2.rarimo.com'],
		},
	},
	contracts: {},
})

export const config = createConfig({
	chains: [rarimo],
	connectors: [
		injected(),
		walletConnect({ projectId: import.meta.env.VITE_REOWN_ID }),
		metaMask(),
		safe(),
	],
	transports: {
		[rarimo.id]: http(),
	},
})

import './index.css'
import 'primereact/resources/themes/lara-light-indigo/theme.css' //theme
import 'primereact/resources/primereact.min.css' //core css
import 'primeicons/primeicons.css' //icons
import 'primeflex/primeflex.css' // flex
import { defineChain } from 'viem'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
	<WagmiProvider config={config}>
		<QueryClientProvider client={queryClient}>
			<PrimeReactProvider>
				<App />
			</PrimeReactProvider>
		</QueryClientProvider>
	</WagmiProvider>
)
