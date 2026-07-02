export const setMin = (prev: undefined | number, cur: number): number => {
	if (prev === undefined || (prev !== undefined && cur < prev)) {
		return cur;
	}
	return prev;
};

export const setMax = (prev: undefined | number, cur: number): number => {
	if (prev === undefined || (prev !== undefined && cur > prev)) {
		return cur;
	}
	return prev;
};

export const createRange = (start: number, num: number) =>
	Array.from(Array(num), (_v, k) => k + start);
