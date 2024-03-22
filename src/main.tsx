import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrimeReactProvider } from "primereact/api";
import { config } from "src/utils/wagmiConfig.ts";
import NetworkGuard from "src/components/NetworkGuard.tsx";
import App from "src/App.tsx";

import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primeicons/primeicons.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<WagmiProvider config={config}>
			<QueryClientProvider client={queryClient}>
				<PrimeReactProvider>
					<NetworkGuard>
						<App />
					</NetworkGuard>
				</PrimeReactProvider>
			</QueryClientProvider>
		</WagmiProvider>
	</React.StrictMode>
);
