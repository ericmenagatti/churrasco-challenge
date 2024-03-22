import { useMemo, useRef } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { shortAddress } from "src/utils/stringUtils";
import {
	TokenTransaction,
	Transaction,
	AllTransactions,
} from "src/types/transactions";
import LoadingTableState from "src/components/LoadingTableState";

const css = `
		.transactionDateHeader {
			color: var(--surface-400);
			font-weight: bold;
		}

		.txStatusMain {
			display: flex;
			align-items: center;
			gap: 20px;
		}

		.txStatusBody {
			display: flex;
			flex-direction: column;
		}
		.txStatusBody > div {
			margin: 0;
			font-weight: bold;
		}
		.txStatusBody > div > span {
			font-weight: normal;
		}
		.txStatusBody > p {
			margin: 0;
			font-weight: normal;
		}

		.txIcon {
			background-color: var(--surface-200);
			font-size: 1rem;
			border-radius: 100px;
			padding: 0.5rem;
		}
		.txIconCopy {
			font-size: 1.2rem;
			border-radius: 100px;
			color: var(--surface-400);
		}
		.txIconCopy:hover {
			cursor: pointer;
		}

		.txAddressButton {
			background-color: var(--surface-100);
			font-weight: bold;
			color: var(--text-color)
		}

		.positiveTokenVariance {
			color: var(--green-500);
		}

		.negativeTokenVariance {
			color: var(--red-500);
		}

		.txExternalLinkIcon {
			font-size: 1.2rem;
		}
		.txExternalLinkIcon:hover {
			cursor: pointer;
		}

		.txStatusColumn {
			width: 25%;
		}

		.txAddressColumn {
			width: 25%;
		}

		.txTokenColumn {
			width: 45%;
		}

		.txLinkColumn {
			width: 5%;
		}
  `;

const TransactionTable = () => {
	const { address, chainId, chain } = useAccount();
	const toast = useRef<Toast>(null);

	const networkAPI = useMemo(
		() =>
			chainId === 1
				? "https://api.etherscan.io/api"
				: "https://api-sepolia.etherscan.io/api",
		[chainId]
	);
	const networkExplorer = useMemo(
		() =>
			chainId === 1 ? "https://etherscan.io" : "https://sepolia.etherscan.io",
		[chainId]
	);

	const { isLoading: isLoadingTxs, data: txList } = useQuery({
		queryKey: ["txList", networkAPI, address],
		queryFn: () =>
			fetch(
				`${networkAPI}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc`
			)
				.then((res) => res.json())
				.then((data) => {
					const dateSplit = data.result.reduce(
						(dayGroup: { [x: string]: Transaction[] }, tx: Transaction) => {
							const date = new Date(+tx.timeStamp * 1000)
								.toISOString()
								.split("T")[0];
							if (!dayGroup[date]) {
								dayGroup[date] = [];
							}
							dayGroup[date].push(tx);
							return dayGroup;
						},
						{}
					);

					return dateSplit;
				}),
	});

	const { isLoading: isLoadingTokenTxs, data: tokenTxList } = useQuery({
		queryKey: ["tokenTxList", networkAPI, address],
		queryFn: () =>
			fetch(
				`${networkAPI}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc`
			)
				.then((res) => res.json())
				.then((data) => {
					const dateSplit = data.result.reduce(
						(
							dayGroup: { [x: string]: TokenTransaction[] },
							tx: TokenTransaction
						) => {
							const date = new Date(+tx.timeStamp * 1000)
								.toISOString()
								.split("T")[0];
							if (!dayGroup[date]) {
								dayGroup[date] = [];
							}
							dayGroup[date].push(tx);
							return dayGroup;
						},
						{}
					);

					return dateSplit;
				}),
	});

	if (isLoadingTxs || isLoadingTokenTxs) return <LoadingTableState />;

	const allTransactions = { ...txList, ...tokenTxList };
	const allTxSortedByDate = Object.keys(allTransactions).map((key) => key);

	const formatDate = (timestamp: number) => {
		const date = new Date(timestamp * 1000);
		// Month DAY, YEAR
		return date.toLocaleDateString("en-US", {
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatHour = (timestamp: number) => {
		const hour = new Date(timestamp * 1000);
		//[HH], [MM], [SS pm/am]
		const splitHour = hour.toLocaleString().split(",")[1].split(":");

		// HH:MM pm/am
		return `${splitHour[0]}:${splitHour[1]}${splitHour[2]
			.slice(2)
			.toLowerCase()}`;
	};

	const formatTokenVariance = (
		sentTo: string,
		amount: string,
		isToken: boolean
	) => {
		const variance = sentTo.toLowerCase() === address?.toLowerCase();
		const formattedAmount = isToken
			? amount
			: formatEther(amount as unknown as bigint);

		return (
			<span
				className={variance ? "positiveTokenVariance" : "negativeTokenVariance"}
			>{`${variance ? "+" : "-"}${formattedAmount}`}</span>
		);
	};

	const copyToClipboard = (data: string, message: string) => {
		navigator.clipboard.writeText(data);
		toast.current?.show({
			severity: "success",
			summary: "Success",
			detail: message,
		});
	};

	const openLinkInNewTab = (txHash: string) => {
		const url = `${networkExplorer}/tx/${txHash}`;
		window.open(url, "_blank", "noopener,noreferrer");
	};

	const txStatusBodyTemplate = (rowData: Transaction) => {
		return (
			<div className="txStatusMain">
				<i
					className={`txIcon pi pi-arrow-${
						rowData.to.toLowerCase() === address?.toLowerCase()
							? "down-left"
							: "up-right"
					}`}
				></i>
				<div className="txStatusBody">
					<div>
						{rowData.to.toLowerCase() === address?.toLowerCase()
							? "Receive "
							: "Sent "}
						<span>Erc 20</span>
					</div>
					<p>{formatHour(+rowData.timeStamp)}</p>
				</div>
				<i
					className="txIconCopy pi pi-copy"
					onClick={() => copyToClipboard(rowData.hash, "Copied Tx Hash")}
				></i>
			</div>
		);
	};

	const txAddressBodyTemplate = (rowData: Transaction) => {
		return (
			<Button
				className="txAddressButton"
				label={shortAddress(rowData.to)}
				icon="pi pi-circle"
				onClick={() => copyToClipboard(rowData.to, "Copied Address")}
				rounded
				outlined
				severity="secondary"
				aria-label="Signin"
			/>
		);
	};

	const txTokenBodyTemplate = (rowData: AllTransactions) => {
		const isToken = !!rowData.contractAddress;
		return (
			<div className="txStatusMain">
				<i
					className={`txIcon pi pi-arrow-${
						rowData.to.toLowerCase() === address?.toLowerCase()
							? "down-left"
							: "up-right"
					}`}
				></i>
				<div className="txStatusBody">
					{formatTokenVariance(rowData.to, rowData.value, isToken)}
					<p>
						{rowData.tokenSymbol
							? rowData.tokenSymbol
							: chain?.nativeCurrency.symbol}
					</p>
				</div>
			</div>
		);
	};

	const txExternalLinkBodyTemplate = (rowData: Transaction) => {
		return (
			<i
				className="txExternalLinkIcon pi pi-external-link"
				onClick={() => openLinkInNewTab(rowData.hash)}
			></i>
		);
	};

	return (
		<>
			<div className="card">
				{allTxSortedByDate.map((date, i) => (
					<div key={`${date}-${i}`}>
						<p className="transactionDateHeader">
							{formatDate(allTransactions[date][0].timeStamp)}
						</p>
						<DataTable
							value={allTransactions[date] as Transaction[]}
							tableStyle={{ minWidth: "60rem" }}
							showHeaders={false}
						>
							<Column
								className="txStatusColumn"
								body={txStatusBodyTemplate}
							></Column>
							<Column
								className="txAddressColumn"
								body={txAddressBodyTemplate}
							></Column>
							<Column
								className="txTokenColumn"
								body={txTokenBodyTemplate}
							></Column>
							<Column
								className="txLinkColumn"
								body={txExternalLinkBodyTemplate}
							></Column>
						</DataTable>
					</div>
				))}
			</div>
			<Toast ref={toast}></Toast>
			<style>{css}</style>
		</>
	);
};

export default TransactionTable;
