/* eslint-disable no-mixed-spaces-and-tabs */
import { useMemo, useRef } from "react";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import { erc20Abi, formatEther, Hex } from "viem";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "primereact/datatable";
import { Column, ColumnSortEvent } from "primereact/column";
import { Toast } from "primereact/toast";
import { AllTransactions } from "src/types/transactions";
import LoadingTableState from "src/components/LoadingTableState";

const css = `
		.header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 20px;
		}
		
		.tokensTableHeaderRow > th {
			background-color: white;
		}

		.tokensTableHeaderRow > th > div {
			color: var(--surface-400);
		}

		.tokenInfoMain {
			display: flex;
			align-items: center;
			gap: 20px;
		}

		.tokenInfoBody {
			display: flex;
			flex-direction: column;
		}

		.tokenInfoBody > div {
			margin: 0;
			font-weight: bold;
		}

		.tokenInfoBody > p {
			margin: 0;
			font-weight: normal;
		}

		.tokenPortfolioBody {
			font-size: 1rem;
      font-weight: bold;
		}

		.tokenPriceBody {
			font-size: 1rem;
      font-weight: bold;
		}

		.tokenIcon {
			background-color: var(--surface-200);
			font-size: 2rem;
			border-radius: 100px;
			padding: 0.5rem;
		}

		.tokenBalanceBody {
      display: flex;
			flex-direction: column;
      align-items: flex-start;
      margin: 0 0;
      font-size: 1rem;
      font-weight: bold;
    }

    .tokenBalanceBody > p {
      margin: 0 0;
			color: var(--surface-400);
    }
  `;

const TokensTable = () => {
	const { address, chainId, chain } = useAccount();
	const toast = useRef<Toast>(null);

	const { data: myBalance, isLoading: isLoadingBalance } = useBalance({
		address: address,
	});

	const networkAPI = useMemo(
		() =>
			chainId === 1
				? "https://api.etherscan.io/api"
				: "https://api-sepolia.etherscan.io/api",
		[chainId]
	);

	const { isLoading: isLoadingPrice, data: ethPrice } = useQuery({
		queryKey: ["ethPrice"],
		queryFn: () =>
			fetch(
				"https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD"
			).then((res) => res.json()),
	});

	const { isLoading: isLoadingTokenTxs, data: tokenTxList } = useQuery({
		queryKey: ["tokenTxListContracts", networkAPI, address],
		queryFn: () =>
			fetch(
				`${networkAPI}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc`
			)
				.then((res) => res.json())
				.then((data) => data.result),
	});

	const uniqueTokens = Array.isArray(tokenTxList)
		? tokenTxList?.filter(
				(value: AllTransactions, index: number, array: AllTransactions[]) =>
					array.findIndex(
						(item) => item.contractAddress === value.contractAddress
					) === index
		  )
		: [];

	const contracts =
		uniqueTokens &&
		uniqueTokens?.map((item: AllTransactions) => {
			const contract = {
				address: item.contractAddress as Hex,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [address],
			} as const;
			return contract;
		});

	const { isLoading: isLoadingContractsBalance, data: contractsBalance } =
		useReadContracts({
			contracts: contracts,
		});

	const tokensData = uniqueTokens.map((item, index) => {
		const balance = contractsBalance
			? contractsBalance[index].result?.toString()
			: "0";
		const tokenWithBalance = {
			...item,
			balance: balance,
		};
		return tokenWithBalance;
	});

	if (isLoadingPrice) return <LoadingTableState />;
	if (isLoadingBalance) return <LoadingTableState />;
	if (isLoadingTokenTxs) return <LoadingTableState />;
	if (isLoadingContractsBalance) return <LoadingTableState />;

	const walletBalance = [
		{
			tokenName: chain?.nativeCurrency.name,
			tokenSymbol: chain?.nativeCurrency.symbol,
			balance: +formatEther(myBalance?.value as bigint),
			contractAddress: "",
			price: ethPrice.USD.toString(),
		},
	];

	const allTokens = [...walletBalance, ...tokensData];

	const allTokensPortfolio = allTokens.map((token) => {
		const sumOfBalances = allTokens.reduce((acc, current) => {
			const usdTotal =
				current.balance && current.price
					? (+current.balance * +current.price).toLocaleString(undefined, {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
					  })
					: 0;
			return acc + usdTotal;
		}, 0);

		const usdTokenBalance =
			token.balance && token.price
				? (+token.balance * +token.price).toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
				  })
				: 0;

		const percentage = (+usdTokenBalance * 100) / sumOfBalances || 0;
		const updatedToken = {
			...token,
			percentage,
		};
		return updatedToken;
	});

	const tokenInfoBodyTemplate = (rowData: AllTransactions) => {
		return (
			<div className="tokenInfoMain">
				<i className="tokenIcon pi pi-bitcoin"></i>
				<div className="tokenInfoBody">
					<div>{rowData.tokenSymbol}</div>
					<p>{rowData.tokenName}</p>
				</div>
			</div>
		);
	};

	const tokenPortfolioBodyTemplate = (rowData: AllTransactions) => {
		return <p className="tokenPortfolioBody">{rowData.percentage}%</p>;
	};

	const tokenPriceBodyTemplate = (rowData: AllTransactions) => {
		const price = rowData.price;
		if (price) return <p className="tokenPriceBody">${price}</p>;
		return <p className="tokenPriceBody">N/A</p>;
	};

	const tokenBalanceBodyTemplate = (rowData: AllTransactions) => {
		const usdTotal =
			rowData.balance && rowData.price
				? (+rowData.balance * +rowData.price).toLocaleString(undefined, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
				  })
				: null;

		if (usdTotal)
			return (
				<div className="tokenBalanceBody">
					<div>${usdTotal}</div>
					<p>
						{rowData.balance} {rowData.tokenSymbol}
					</p>
				</div>
			);

		return (
			<div className="tokenBalanceBody">
				<p>
					{rowData.balance} {rowData.tokenSymbol}
				</p>
			</div>
		);
	};

	const tokenPriceSortFunc = (e: ColumnSortEvent) => {
		const array = [...allTokensPortfolio];
		array.sort((a, b) => {
			const value1 = a.price || null;
			const value2 = b.price || null;
			let result = null;

			if (value1 == null && value2 != null) result = -1;
			else if (value1 != null && value2 == null) result = 1;
			else if (value1 == null && value2 == null) result = 0;
			else if (typeof value1 === "string" && typeof value2 === "string")
				result = value1.localeCompare(value2);
			else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

			return e.order! * result;
		});
		return array;
	};

	const tokenBalanceSortFunc = (e: ColumnSortEvent) => {
		const array = [...allTokensPortfolio];
		array.sort((a, b) => {
			const value1 = a.balance.toString();
			const value2 = b.balance.toString();
			let result = null;

			if (value1 == null && value2 != null) result = -1;
			else if (value1 != null && value2 == null) result = 1;
			else if (value1 == null && value2 == null) result = 0;
			else if (typeof value1 === "string" && typeof value2 === "string")
				result = value1.localeCompare(value2);
			else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;

			return e.order! * result;
		});
		return array;
	};

	return (
		<>
			<DataTable
				value={allTokensPortfolio as AllTransactions[]}
				tableStyle={{ minWidth: "60rem" }}
				size="large"
				pt={{
					headerRow: {
						className: "tokensTableHeaderRow",
					},
				}}
			>
				<Column header="Token" body={tokenInfoBodyTemplate}></Column>
				<Column
					header="Portfolio%"
					body={tokenPortfolioBodyTemplate}
					sortable
					sortField="percentage"
				></Column>
				<Column
					header="Price(24hr)"
					body={tokenPriceBodyTemplate}
					sortable
					sortField="price"
					sortFunction={tokenPriceSortFunc}
				></Column>
				<Column
					header="Balance"
					body={tokenBalanceBodyTemplate}
					sortable
					sortField="balance"
					sortFunction={tokenBalanceSortFunc}
				></Column>
			</DataTable>
			<Toast ref={toast}></Toast>
			<style>{css}</style>
		</>
	);
};

export default TokensTable;
