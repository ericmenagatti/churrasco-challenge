import { useRef, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { mainnet, sepolia } from "viem/chains";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Toast } from "primereact/toast";

const css = `
    .networkSelectDropdown {
      border-radius: 35px;
    }
`;

const NetworkSelector = () => {
	const { chainId } = useAccount();
	const { switchChainAsync } = useSwitchChain();

	const toast = useRef<Toast>(null);

	const networks = [
		{ name: sepolia.name, chainId: sepolia.id },
		{ name: mainnet.name, chainId: mainnet.id },
	];

	const [selectedNetwork, setSelectedNetwork] = useState<{
		name: string;
		chainId: number;
	}>(networks.filter((network) => network.chainId === chainId)[0]);

	const onChangeNetwork = async (e: DropdownChangeEvent) => {
		await switchChainAsync({ chainId: e.value.chainId });
		setSelectedNetwork(e.value);
		toast.current?.show({
			severity: "success",
			summary: "Success",
			detail: "Switched Network",
		});
	};

	return (
		<>
			<Dropdown
				className="networkSelectDropdown"
				value={selectedNetwork}
				onChange={onChangeNetwork}
				options={networks}
				optionLabel="name"
			/>
			<Toast ref={toast}></Toast>
			<style>{css}</style>
		</>
	);
};

export default NetworkSelector;
