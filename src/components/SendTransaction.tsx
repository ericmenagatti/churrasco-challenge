import { useRef } from "react";
import {
	useAccount,
	useBalance,
	useEstimateGas,
	useGasPrice,
	useSendTransaction,
	useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther, Hex, formatGwei } from "viem";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { Message } from "primereact/message";
import { InputText } from "primereact/inputtext";
import { Accordion, AccordionTab } from "primereact/accordion";
import { useQuery } from "@tanstack/react-query";

const css = `
    .sendTxMainContent {
      border-radius: 35px
    }

    .sendTxDialogContainer {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background-color: var(--primary-color-text);
      border-radius: 35px;
			width: 30rem;
    }

    .sendTxIconContainer {
      border-radius: 100px;
      background-color: var(--primary-color);
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 6rem;
      width: 6rem;
      margin-top: -4rem;
    }

    .sendTxIcon {
      color: var(--primary-color-text);
			font-size: 2rem;
    }

    .sendTxDialogHeader {
      font-weight: bold;
      display: block;
      margin-bottom: 1rem;
      margin-top: 1rem;
      font-size: 1.5rem;
    }

    .sendTxButtonContainer {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-top: 10px;
			justify-content: space-between;
    }
		.sendTxButtonContainer > button {
			width: 8rem;
			margin-bottom: 1rem;
		}

		.sendTxFormField {
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		.sendTxForm {
			display: flex;
			flex-direction: column;
			gap: 20px;
		}

		.sendTxActionButton {
			border-radius: 35px;
		}

		.sendTxAccordionHeaderContent {
			display: flex;
			width: 100%;
			justify-content: space-between;
		}
  `;

const SendTransaction = () => {
	const toast = useRef<Toast>(null);
	const { address, chain, chainId } = useAccount();

	const { data: ethBalance } = useBalance({
		address: address,
	});

	const { data: estimatedGas, isLoading: isLoadingGasEstimate } =
		useEstimateGas({
			type: "legacy",
		});

	const { data: gasPrice, isLoading: isLoadingGasPrice } = useGasPrice();

	const {
		data: txHash,
		error: txError,
		isPending,
		sendTransactionAsync,
		reset,
	} = useSendTransaction();

	const { isLoading, isSuccess } = useWaitForTransactionReceipt({
		hash: txHash,
	});

	const { isLoading: isLoadingPrice, data: ethPrice } = useQuery({
		queryKey: ["ethPrice"],
		queryFn: () =>
			fetch(
				"https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD"
			).then((res) => res.json()),
	});

	const formSchema = z.object({
		address: z
			.string()
			.length(42, {
				message: "Address must have 42 characters.",
			})
			.regex(/^0x/, {
				message: "Please input a correct ethereum address.",
			}),
		value: z.coerce
			.number()
			.positive({
				message: "Please input a correct value.",
			})
			.max(
				ethBalance?.value
					? Number(formatEther(ethBalance?.value as bigint))
					: Number.MAX_VALUE,
				{ message: `You don't have enough ${chain?.nativeCurrency.symbol}.` }
			)
			.min(0.000000000000000001),
	});

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			address: "",
			value: 0,
		},
	});

	const accept = () => {
		toast.current?.show({
			severity: "info",
			summary: "Confirmed",
			detail: "You have accepted",
			life: 3000,
		});
	};

	const onClickSend = () => {
		confirmDialog({
			header: "Transaction",
			icon: "pi pi-exclamation-triangle",
			defaultFocus: "accept",
			accept,
		});
	};

	if (isLoadingPrice) return null;
	if (isLoadingGasEstimate) return null;
	if (isLoadingGasPrice) return null;

	const estimatedGasUsed =
		estimatedGas && gasPrice
			? +formatGwei(estimatedGas as bigint) * +formatGwei(gasPrice as bigint)
			: 0;
	const estimatedGasTotalPrice = estimatedGasUsed * ethPrice.USD;

	const estimatedValue = form.watch().value;
	const estimatedValueTotalPrice = estimatedValue * ethPrice.USD;

	const onSubmit = async (data: { address: string; value: number }) => {
		const totalEstimate = estimatedValue + estimatedGasUsed;
		if (totalEstimate > Number(formatEther(ethBalance?.value as bigint))) {
			form.setError("value", {
				message: `You don't have enough ${chain?.nativeCurrency.symbol} to pay the fees.`,
			});
			return;
		}
		await sendTransactionAsync({
			to: data.address as Hex,
			value: parseEther(data.value.toFixed(18).toString()),
		});
		form.reset();
	};

	return (
		<>
			<ConfirmDialog
				className="sendTxMainContent"
				content={({ headerRef, hide, message }) => (
					<div className="sendTxDialogContainer">
						<div className="sendTxIconContainer">
							<i className="pi pi-arrow-up-right sendTxIcon"></i>
						</div>
						<span className="sendTxDialogHeader" ref={headerRef}>
							{message.header}
						</span>
						<form onSubmit={form.handleSubmit(onSubmit)} className="sendTxForm">
							<Accordion>
								<AccordionTab
									header={
										<div className="sendTxAccordionHeaderContent">
											<span>Estimated Fee</span>
											<span>
												$
												{estimatedGasTotalPrice.toLocaleString(undefined, {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}
											</span>
										</div>
									}
								>
									<div>
										{estimatedGasUsed} {chain?.nativeCurrency.symbol}
									</div>
								</AccordionTab>
							</Accordion>
							<Controller
								name="address"
								control={form.control}
								render={({ field, fieldState }) => (
									<div className="sendTxFormField">
										<InputText
											id={field.name}
											value={field.value}
											className={fieldState.error ? "p-invalid" : ""}
											onChange={(e) => field.onChange(e.target.value)}
											placeholder="Recipient Address"
										/>
										{fieldState.error ? (
											<Message
												text={fieldState.error?.message}
												severity="error"
											/>
										) : null}
									</div>
								)}
							/>
							<Controller
								name="value"
								control={form.control}
								render={({ field, fieldState }) => (
									<div className="sendTxFormField">
										<InputNumber
											inputId="txValue"
											value={field.value}
											onValueChange={field.onChange}
											maxFractionDigits={18}
											prefix={`${chain?.nativeCurrency.symbol} `}
										/>
										{fieldState.error ? (
											<Message
												text={fieldState.error?.message}
												severity="error"
											/>
										) : null}
									</div>
								)}
							/>
							<Accordion>
								<AccordionTab
									header={
										<div className="sendTxAccordionHeaderContent">
											<span>Total</span>
											<span>
												$
												{(
													estimatedGasTotalPrice + estimatedValueTotalPrice
												).toLocaleString(undefined, {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												})}
											</span>
										</div>
									}
								>
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: "10px",
										}}
									>
										<div style={{ display: "flex", flexDirection: "column" }}>
											<span>Amount</span>
											<span>
												{estimatedValue} {chain?.nativeCurrency.symbol}
											</span>
										</div>
										<div style={{ display: "flex", flexDirection: "column" }}>
											<span>Fee</span>
											<span>
												{estimatedGasUsed} {chain?.nativeCurrency.symbol}
											</span>
										</div>
									</div>
								</AccordionTab>
							</Accordion>
							<div className="sendTxButtonContainer">
								<Button
									label="Confirm"
									type="submit"
									disabled={chainId === 1 || isLoading || isPending} // Disable Transactions on Ethereum Network
								/>
								<Button
									label="Cancel"
									outlined
									onClick={(event) => {
										hide(event);
										form.reset();
										reset();
									}}
								/>
							</div>
							{isPending ? (
								<Message
									text="Waiting for MetaMask confirmation."
									severity="info"
								/>
							) : null}
							{isLoading ? (
								<Message
									text="Your transaction is in progress."
									severity="info"
								/>
							) : null}
							{isSuccess ? (
								<Message text="Transaction completed." severity="success" />
							) : null}
							{txError ? (
								<Message text={txError.name} severity="error" />
							) : null}
							{chainId === 1 ? (
								<Message text="Disabled on ETH Network." severity="error" />
							) : null}
						</form>
					</div>
				)}
			/>
			<Button
				onClick={onClickSend}
				icon="pi pi-arrow-up-right"
				label="Send"
				className="sendTxActionButton"
			/>
			<Toast ref={toast} />
			<style>{css}</style>
		</>
	);
};

export default SendTransaction;
