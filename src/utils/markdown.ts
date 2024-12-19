import { setMin, setMax } from "./range";

export const checkHeading = (content: string): number => {
	const match = content.match(/^(#+) /);
	if (!match || !match[1]) return 0;
	return match[1].length;
};

export type FenceType = { fenceType: "`" | "~"; fenceNum: number } | null;
export const checkFence = (content: string): FenceType => {
	const backticks = content.match(/^(`{3,})/);
	if (backticks && backticks[1])
		return { fenceType: "`", fenceNum: backticks[1].length };

	const tildes = content.match(/^(~{3,})/);
	if (tildes && tildes[1])
		return { fenceType: "~", fenceNum: tildes[1].length };

	return null;
};

export const getFenceStatus = (
	prev: FenceType,
	current: FenceType
): FenceType => {
	if (!current) return prev;
	if (!prev) return current;

	if (
		current.fenceType == prev.fenceType &&
		current.fenceNum >= prev.fenceNum
	) {
		return null;
	}

	return prev;
};

export const getHeadingLines = (
	editor: {
		getLine: (number: number) => string;
	},
	from: number,
	to: number,
	options?: { includesNoHeadingsLine?: boolean }
) => {
	const headingLines: number[] = [];
	let minHeading: undefined | number = undefined;
	let maxHeading: undefined | number = undefined;
	let fence: FenceType = null;

	for (let line = Math.min(from, to); line <= Math.max(from, to); line++) {
		fence = getFenceStatus(fence, checkFence(editor.getLine(line)));
		if (fence) continue;

		const heading = checkHeading(editor.getLine(line));

		// Although it is called “forced”, it is affected by pre-processing↑ such as fence.
		// Whether to ignore even this needs to be considered.
		if (options?.includesNoHeadingsLine || heading > 0) {
			headingLines.push(line);
			minHeading = setMin(minHeading, heading);
			maxHeading = setMax(maxHeading, heading);
		}
	}
	return { headingLines, minHeading, maxHeading };
};

// goes backwards from the `from` line, returns line number of first line containing any heading
export const getPreviousHeading = (
	editor: {
		getLine: (number: number) => string;
	},
	from: number
) => {
	let fence: FenceType = null;
	const start = from > 0 ? from - 1 : 0;

	for (let line = start; line >= 0; line--) {
		fence = getFenceStatus(fence, checkFence(editor.getLine(line)));
		if (fence) continue;

		if (checkHeading(editor.getLine(line)) > 0) {
			return line;
		}
	}

	// no heading found
	return undefined;
};

export const removeFromRegExpStrings = (
	str: string,
	regExpStrings: string[]
): string => {
	const remove = regExpStrings
		.reduce((acc, cur) => {
			try {
				return acc.replace(new RegExp(cur), "$1");
			} catch (error) {
				return acc;
			}
		}, str)
		.replace(/^#+ /, "");

	return remove;
};
