export interface Transaction {
	blockHash: string;
	blockNumber: string;
	confirmations: string;
	contractAddress: string;
	cumulativeGasUsed: string;
	from: string;
	functionName: string;
	gas: string;
	gasPrice: string;
	gasUsed: string;
	hash: string;
	input: string;
	isError: string;
	methodId: string;
	nonce: string;
	timeStamp: string;
	to: string;
	transactionIndex: string;
	txreceipt_status: string;
	value: string;
}

export interface TokenTransaction {
	blockNumber: string;
	timeStamp: string;
	hash: string;
	nonce: string;
	blockHash: string;
	from: string;
	contractAddress: string;
	to: string;
	value: string;
	tokenName: string;
	tokenSymbol: string;
	tokenDecimal: string;
	transactionIndex: string;
	gas: string;
	gasPrice: string;
	gasUsed: string;
	cumulativeGasUsed: string;
	input: string;
	confirmations: string;
}

export interface AllTransactions extends Transaction, TokenTransaction {
	balance?: string;
	price?: string;
	percentage?: number;
}
