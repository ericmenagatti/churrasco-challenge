import { useAccount } from "wagmi";
import { mainnet, sepolia } from "viem/chains";

/**
 * Check if user has their wallet connected and if they are in the
 * expected network
 *
 * @returns -1 = "Not Connected" 0 = "On Different Network" 1 = "Connected"
 */
export const useWalletConnected = (): number => {
	const { isConnected, chainId } = useAccount();

	const userOnCorrectNetwork = chainId === sepolia.id || chainId === mainnet.id;

	if (!isConnected) {
		return -1;
	}
	if (isConnected && userOnCorrectNetwork) {
		return 1;
	}
	return 0;
};
