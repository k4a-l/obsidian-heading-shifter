import type { EditorPosition } from "obsidian";

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

export type LineBlock = { start: number; end: number };
export const mergeLineBlocks = (blocks: LineBlock[]): LineBlock[] => {
	const sorted = [...blocks].sort((a, b) => a.start - b.start);
	const merged: LineBlock[] = [];

	for (const block of sorted) {
		const last = merged[merged.length - 1];
		if (last !== undefined && block.start <= last.end + 1) {
			last.end = Math.max(last.end, block.end);
		} else {
			merged.push({ start: block.start, end: block.end });
		}
	}

	return merged;
};

export type LineSelection = {
	anchor: Pick<EditorPosition, "line">;
	head: Pick<EditorPosition, "line">;
};

export const selectionsToLineBlocks = (
	selections: LineSelection[],
): LineBlock[] =>
	mergeLineBlocks(
		selections.map((selection) => ({
			start: Math.min(selection.anchor.line, selection.head.line),
			end: Math.max(selection.anchor.line, selection.head.line),
		})),
	);
