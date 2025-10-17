import { TABSIZE } from "constant/editor";
import type { MinimumEditor } from "./editorChange";
import { setMax, setMin } from "./range";

export const checkHeading = (content: string): number => {
	const match = content.match(/^(#+) /);
	if (!match || !match[1]) return 0;
	return match[1].length;
};

export type FenceType = { fenceType: "`" | "~"; fenceNum: number } | null;
export const checkFence = (content: string): FenceType => {
	const backticks = content.match(/^(`{3,})/);
	if (backticks?.[1]) return { fenceType: "`", fenceNum: backticks[1].length };

	const tildes = content.match(/^(~{3,})/);
	if (tildes?.[1]) return { fenceType: "~", fenceNum: tildes[1].length };

	return null;
};

export const getFenceStatus = (
	prev: FenceType,
	current: FenceType,
): FenceType => {
	if (!current) return prev;
	if (!prev) return current;

	if (
		current.fenceType === prev.fenceType &&
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
	options?: { includesNoHeadingsLine?: boolean },
) => {
	const headingLines: number[] = [];
	let minHeading: undefined | number;
	let maxHeading: undefined | number;
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
	from: number,
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

/** Returns the result of the substitution only when the substitution is performed, otherwise undefined */
const replaceFunc = (str: string, regExp: RegExp): string | undefined => {
	try {
		const replaced = str.replace(regExp, "$1");
		if (replaced !== str) {
			return replaced;
		}
	} catch (error) {
		console.error(error);
	}
	return undefined;
};

export const removeUsingRegexpStrings = (
	str: string,
	regExpStrings: { beginning?: string[]; surrounding?: string[] },
): string => {
	let removed = str;

	// beginning
	for (const regExpStr of regExpStrings.beginning ?? []) {
		const regExp = new RegExp(`^\\s*${regExpStr}(.*)`);
		const result = replaceFunc(removed, regExp);
		if (result !== undefined) {
			removed = result;
			break;
		}
	}

	// surrounding
	for (const regExpStr of regExpStrings.surrounding ?? []) {
		const regExp = new RegExp(`${regExpStr}(.*)${regExpStr}`);
		const result = replaceFunc(removed, regExp);
		if (result !== undefined) {
			removed = result;
			break;
		}
	}

	return removed;
};

export const countIndentLevel = (line: string, tabSize = TABSIZE): number => {
	const leadingContent = line.match(/^(\s*)/)?.[0];
	if (!leadingContent) return 0;

	const tabCount = (leadingContent.match(/\t/g) || []).length;
	const spaceCount = (leadingContent.match(/ /g) || []).length;

	return tabCount + Math.floor(spaceCount / tabSize);
};

export const getListChildrenLines = (
	editor: MinimumEditor,
	{
		parentLineNumber,
		tabSize,
	}: {
		parentLineNumber: number;
		tabSize?: number;
	},
): number[] => {
	const lineNumbers: number[] = [];

	const startLine = editor.getLine(parentLineNumber);
	const prevParentIndentLevel = countIndentLevel(startLine, tabSize);

	for (let lineN = parentLineNumber + 1; lineN < editor.lineCount(); lineN++) {
		const line = editor.getLine(lineN);
		const indentLevel = countIndentLevel(line, tabSize);
		const isBulleted = /^\s*[-*]\s+/.test(line);
		const isNumbered = /^\s*\d+\.\s+/.test(line);

		if (!isBulleted && !isNumbered) break;
		if (indentLevel <= prevParentIndentLevel) break;

		lineNumbers.push(lineN);
	}
	return lineNumbers;
};
