import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import { Skeleton } from "primereact/skeleton";
import { useQuery } from "@tanstack/react-query";

const css = `
    .walletBalanceContainer {
      padding-bottom: 20px;
    }
    .walletBalanceTitle {
      color: var(--surface-600);
    }
    .walletBalanceContent {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .walletBalanceValue {
      display: flex;
      align-items: center;
      margin: 0 0;
      font-size: 2rem;
      font-weight: bold;
    }
    .walletBalanceValue > p {
      margin: 0 0;
    }
    .walletBalanceValue > span {
      color: var(--surface-400);
    }
    .walletBalanceIcon {
      font-size: 2rem;
    }
  `;

const WalletBalance = () => {
	const { address } = useAccount();
	const [hideValue, setHideValue] = useState(false);

	const {
		data: ethBalance,
		error,
		isLoading: isLoadingBalance,
	} = useBalance({
		address: address,
	});

	const { isLoading: isLoadingPrice, data: ethPrice } = useQuery({
		queryKey: ["ethPrice"],
		queryFn: () =>
			fetch(
				"https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD"
			).then((res) => res.json()),
	});

	const formattedBalance =
		ethBalance &&
		ethPrice &&
		(+formatEther(ethBalance?.value as bigint) * ethPrice.USD).toLocaleString(
			undefined,
			{ minimumFractionDigits: 2, maximumFractionDigits: 2 }
		);

	return (
		<div className="walletBalanceContainer">
			<p className="walletBalanceTitle">Valor de la Cartera</p>
			{isLoadingPrice || isLoadingBalance ? (
				<Skeleton width="13rem" height="39px"></Skeleton>
			) : (
				<>
					{error ? (
						<p className="walletBalanceValue">NOT AVAILABLE</p>
					) : (
						<div className="walletBalanceContent">
							{hideValue ? (
								<Skeleton width="13rem" height="39px"></Skeleton>
							) : (
								<div className="walletBalanceValue">
									<p>
										${formattedBalance.slice(0, formattedBalance.length - 3)}
									</p>
									<span>{formattedBalance.slice(3)}</span>
								</div>
							)}
							<i
								className={`pi pi-eye${
									hideValue ? "" : "-slash"
								} walletBalanceIcon`}
								onClick={() => setHideValue((prev) => !prev)}
							></i>
						</div>
					)}
				</>
			)}
			<style>{css}</style>
		</div>
	);
};

export default WalletBalance;
