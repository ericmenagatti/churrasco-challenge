import { useRef, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";

const css = `
    .tokenSelectDropdown {
      border-radius: 35px;
    }
`;

const TokenModeSelector = () => {
	const toast = useRef<Toast>(null);

	const modes = [{ name: "Tokens View", code: "TKN" }];

	const [selectedMode, setSelectedMode] = useState<{
		name: string;
		code: string;
	}>(modes[0]);

	return (
		<>
			<Dropdown
				className="tokenSelectDropdown"
				value={selectedMode}
				onChange={(e) => setSelectedMode(e.value)}
				options={modes}
				optionLabel="name"
			/>
			<Toast ref={toast}></Toast>
			<style>{css}</style>
		</>
	);
};

export default TokenModeSelector;
