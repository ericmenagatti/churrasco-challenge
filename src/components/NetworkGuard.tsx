import { FC, PropsWithChildren, useEffect, useMemo, useRef } from "react";
import { useConnect, useSwitchChain } from "wagmi";
import { sepolia } from "viem/chains";
import { Toast } from "primereact/toast";
import { Message } from "primereact/message";
import { useWalletConnected } from "src/hooks/useWalletConnected";

const NetworkGuard: FC<PropsWithChildren> = ({ children }) => {
	const { connectors, connectAsync } = useConnect();
	const { switchChainAsync } = useSwitchChain();
	const walletConnected = useWalletConnected();

	const toast = useRef<Toast>(null);

	const metamaskConnector = useMemo(
		() =>
			connectors.filter(
				(connector) => connector.icon && connector.name === "MetaMask"
			)[0],
		[connectors]
	);

	useEffect(() => {
		const walletConnect = async () => {
			await connectAsync({ connector: metamaskConnector });
			toast.current?.show({
				severity: "success",
				summary: "Success",
				detail: "Wallet Signed in",
			});
		};
		const walletSwitchNetwork = async () => {
			await switchChainAsync({ chainId: sepolia.id });
			toast.current?.show({
				severity: "success",
				summary: "Success",
				detail: "Switched Network",
			});
		};
		if (walletConnected === -1) {
			walletConnect();
		}
		if (walletConnected === 0) {
			walletSwitchNetwork();
		}
	}, [connectAsync, switchChainAsync, metamaskConnector, walletConnected]);

	if (walletConnected === -1)
		return <Message text="Please connect your Metamask Wallet" />;
	if (walletConnected === 0)
		return <Message text="Please make sure you are on the correct Network" />;

	return (
		<>
			{children}
			<Toast ref={toast}></Toast>
		</>
	);
};

export default NetworkGuard;
