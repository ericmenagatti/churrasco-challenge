export const shortAddress = (address: string) => {
	if (address) {
		if (address.length === 42) {
			return `${address.substring(0, 6)}...${address.substring(
				address.length - 6,
				address.length
			)}`;
		}
		return address;
	}

	return "";
};
