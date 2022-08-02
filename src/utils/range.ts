export const setMin = (prev: undefined | number, cur: number): number => {
	if (prev == undefined || (prev !== undefined && cur < prev)) {
		return cur;
	}
	return prev;
};

export const setMax = (prev: undefined | number, cur: number): number => {
	if (prev == undefined || (prev !== undefined && cur > prev)) {
		return cur;
	}
	return prev;
};
