import { useRef } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { SplitButton } from "primereact/splitbutton";
import { Image } from "primereact/image";
import { shortAddress } from "src/utils/stringUtils";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";

const css = `
    .walletButtonImage {
      display: flex;
      margin-right: 5px;
    }

    .walletButtonDefault {
      border-top-left-radius: 35px;
      border-bottom-left-radius: 35px;
    }

    .walletButtonIcon {
      border-top-right-radius: 35px;
      border-bottom-right-radius: 35px;
    }
`;

const WalletButton = () => {
	const { connectors, connect } = useConnect();
	const { disconnect } = useDisconnect();
	const { address, isConnected } = useAccount();

	const toast = useRef<Toast>(null);

	const metamaskConnector = connectors.filter(
		(connector) => connector.icon && connector.name === "MetaMask"
	)[0];

	const menu = [
		{
			label: "Disconnect",
			icon: "pi pi-sign-out",
			command: () => {
				disconnect();
				toast.current?.show({
					severity: "warn",
					summary: "Sign out",
					detail: "Signed out",
				});
			},
		},
	];

	const connectWallet = () => {
		if (metamaskConnector) {
			connect({ connector: metamaskConnector });
		}
	};

	const copyWalletAddress = () => {
		if (isConnected) {
			navigator.clipboard.writeText(address as string);
			toast.current?.show({
				severity: "success",
				summary: "Success",
				detail: "Copied Address",
			});
		}
	};

	return (
		<>
			{isConnected ? (
				<SplitButton
					label={address ? shortAddress(address) : "Connect Wallet"}
					icon={() => (
						<Image
							className="walletButtonImage"
							alt="Image"
							width="18"
							src={metamaskConnector ? metamaskConnector.icon : ""}
						/>
					)}
					onClick={copyWalletAddress}
					model={menu}
					severity="secondary"
					outlined
					buttonClassName="walletButtonDefault"
					menuButtonClassName="walletButtonIcon"
				/>
			) : (
				<Button
					label="Connect Wallet"
					icon={() => (
						<Image
							alt="Image"
							width="18"
							src={metamaskConnector ? metamaskConnector.icon : ""}
						/>
					)}
					onClick={connectWallet}
					rounded
					outlined
					severity="secondary"
					aria-label="Signin"
				/>
			)}
			<Toast ref={toast}></Toast>
			<style>{css}</style>
		</>
	);
};

export default WalletButton;
