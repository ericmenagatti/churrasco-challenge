import { useRef, useState } from "react";
import { TabMenu } from "primereact/tabmenu";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import TokensTable from "src/components/TokensTable";
import TransactionTable from "src/components/TransactionTable";
import WalletBalance from "src/components/WalletBalance";
import SendTransaction from "src/components/SendTransaction";
import WalletButton from "src/components/WalletButton";
import NetworkSelector from "src/components/NetworkSelector";
import TokenModeSelector from "src/components/TokenModeSelector";

const css = `
		html {
			background-color: var(--surface-100);
		}

		.mainAppContainer {
			padding: 0 15px;
		}

		.mainAppCard {
			padding: 20px 15px;
			margin-top: 10px;
			box-shadow: none;
		}
		.mainAppCard > div, .mainAppCard > div > div {
			padding: 0;
		}

    .mainAppTabMenu {
			overflow: hidden;
      border: solid gray 2px;
      border-radius: 35px;
      width: fit-content;
    }

		.mainAppTabMenuList {
      border: transparent;
      border-radius: 35px;
      overflow: hidden;
      margin-left: -1px;
      margin-right: -2px;
    }

		.mainAppTabMenuItem {
      margin-top: -2px
    }
		.mainAppTabMenuItem[data-p-highlight="true"] > a {
			border: solid white;
      border-radius: 35px;
      color: white;
      background-color: #06b6d4;
		}
    
    .mainAppTabMenuAction {
      border: none;
			transition: none;
    }

		.mainAppContent {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 20px;
			padding: 20px 0;
		}
		
		.mainAppItems {
			display: flex;
			align-items: center;
			justify-content: start;
			gap: 20px;
		}

		.mainAppDownloadPDFButton {
			width: 5rem;
			border-radius: 25px;
		}
  `;

const App = () => {
	const toast = useRef<Toast>(null);

	const tabs = [
		{ label: "Tokens" },
		{ label: "NFTs", disabled: true },
		{ label: "DeFI", disabled: true },
		{ label: "Transactions" },
	];

	const [selectedTab, setSelectedTab] = useState(0);

	return (
		<div className="mainAppContainer">
			<WalletBalance />
			<Card className="mainAppCard">
				<TabMenu
					className="mainAppTabMenu"
					model={tabs}
					activeIndex={selectedTab}
					onTabChange={(e) => setSelectedTab(e.index)}
					pt={{
						menu: {
							className: "mainAppTabMenuList",
						},
						menuitem: {
							className: "mainAppTabMenuItem",
						},
						action: {
							className: "mainAppTabMenuAction",
						},
					}}
				/>
				<div className="mainAppContent">
					<div className="mainAppItems">
						<WalletButton />
						<NetworkSelector />
						{selectedTab === 3 ? <SendTransaction /> : null}
						{selectedTab === 0 ? <TokenModeSelector /> : null}
					</div>
					{selectedTab === 3 ? (
						<div className="mainAppItems">
							<Button
								className="mainAppDownloadPDFButton"
								icon="pi pi-download"
								rounded
								outlined
								severity="secondary"
								aria-label="Download"
							/>
						</div>
					) : null}
				</div>
				{selectedTab === 0 ? <TokensTable /> : null}
				{selectedTab === 3 ? <TransactionTable /> : null}
			</Card>
			<Toast ref={toast}></Toast>
			<style>{css}</style>
		</div>
	);
};

export default App;
