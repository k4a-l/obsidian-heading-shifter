export const checkHeading = (content: string): number => {
	const match = content.match(/^(#+) /);
	if (!match) return 0;
	if (match[1]) return match[1].length;
	return 0;
};
