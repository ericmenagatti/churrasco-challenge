import { http, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

declare module "wagmi" {
	interface Register {
		config: typeof config;
	}
}

export const config = createConfig({
	chains: [mainnet, sepolia],
	connectors: [injected({ target: "metaMask" })],
	transports: {
		[mainnet.id]: http(),
		[sepolia.id]: http(),
	},
});
