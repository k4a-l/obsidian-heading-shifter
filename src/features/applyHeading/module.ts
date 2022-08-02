export const applyHeading = (chunk: string, heading: number): string => {
	const remove = chunk.replace(/^#+ /, "");

	if (heading <= 0) return remove;
	return (
		new Array(heading).fill("#").reduce((prev, cur) => {
			return cur + prev;
		}, " ") + remove
	);
};
