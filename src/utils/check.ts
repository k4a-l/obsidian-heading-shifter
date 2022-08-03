export const checkHeading = (content: string): number => {
	const match = content.match(/^(#+) /);
	if (!match || !match[1]) return 0;
	return match[1].length;
};

export const checkFence = (content: string): boolean => {
	const match = content.match(/^`{3}/);
	if (!match) return false;
	return true;
};
