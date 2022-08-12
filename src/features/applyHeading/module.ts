/**Return heading applied string from chunk
 * @return heading applied string
 * @params chunk - String to which heading is to be applied
 * @params headingSize - The Heading Size to be applied
 */
export const applyHeading = (chunk: string, headingSize: number): string => {
	const remove = chunk.replace(/^#+ /, "").replace(/^(\-|\*|\d+\.) /, "");

	if (headingSize <= 0) return remove;
	return (
		new Array(headingSize).fill("#").reduce((prev, cur) => {
			return cur + prev;
		}, " ") + remove
	);
};
