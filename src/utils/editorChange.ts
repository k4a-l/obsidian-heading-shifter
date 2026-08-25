import { TABSIZE } from "constant/editor";
import type {
	Editor,
	EditorChange,
	EditorPosition,
	EditorRangeOrCaret,
	EditorSelection,
} from "obsidian";
import type { HeadingShifterSettings } from "settings";
import { match, P } from "ts-pattern";
import { countIndentLevel, getListChildrenLines } from "./markdown";

/** Narrower than obsidian's `Editor` (which is assignable to it),
 * so operations can be driven with a lightweight mock in tests without casting. */
export type MinimumEditor = Pick<
	Editor,
	| "getLine"
	| "getCursor"
	| "lineCount"
	| "listSelections"
	| "transaction"
	| "setSelection"
	| "setCursor"
>;

/** Compute the minimal character-level EditorChange between old and new line text.
 * Preserves common prefix and suffix so the editor's cursor/selection mapping
 * naturally tracks the modified text. Returns null if there is no change. */
export const computeLineChange = (
	lineNumber: number,
	oldText: string,
	newText: string,
): EditorChange | null => {
	if (oldText === newText) return null;

	let start = 0;
	const oldLen = oldText.length;
	const newLen = newText.length;
	const minLen = Math.min(oldLen, newLen);

	while (start < minLen && oldText[start] === newText[start]) {
		start++;
	}

	let oldEnd = oldLen - 1;
	let newEnd = newLen - 1;

	while (
		oldEnd >= start &&
		newEnd >= start &&
		oldText[oldEnd] === newText[newEnd]
	) {
		oldEnd--;
		newEnd--;
	}

	return {
		text: newText.slice(start, newEnd + 1),
		from: { line: lineNumber, ch: start },
		to: { line: lineNumber, ch: oldEnd + 1 },
	};
};

/** Combine heading changes with indent changes, dropping any indent change that
 * targets a line already edited by a heading change. Two changes on the same
 * line would corrupt a single editor transaction; heading changes win. */
export const combineHeadingAndIndentChanges = (
	headingChanges: EditorChange[],
	indentChanges: EditorChange[],
): EditorChange[] => {
	const headingLines = new Set(
		headingChanges.map((change) => change.from.line),
	);
	return [
		...headingChanges,
		...indentChanges.filter((change) => !headingLines.has(change.from.line)),
	];
};

export const composeLineChanges = (
	editor: MinimumEditor,
	lineNumbers: number[],
	changeCallback: (chunk: string, settings?: HeadingShifterSettings) => string,
	settings?: HeadingShifterSettings,
): EditorChange[] => {
	const editorChanges: EditorChange[] = [];

	for (const line of lineNumbers) {
		const currentLine = editor.getLine(line);
		const shifted = changeCallback(currentLine, settings);
		const change = computeLineChange(line, currentLine, shifted);
		if (change) {
			editorChanges.push(change);
		}
	}

	return editorChanges;
};

export const createListIndentChanges = (
	editor: MinimumEditor,
	{
		parentLineNumber,
		parentIndentLevel,
		tabSize = TABSIZE,
		changeHeadingLevel,
	}: {
		parentLineNumber: number;
		parentIndentLevel: number;
		tabSize?: number;
		changeHeadingLevel?: boolean;
	},
): EditorChange[] => {
	const parentLine = editor.getLine(parentLineNumber);
	const prevParentIndentLevel = countIndentLevel(parentLine, tabSize);

	const childrenNumbers = getListChildrenLines(editor, {
		parentLineNumber,
		tabSize,
	});

	const indentDelta = parentIndentLevel - prevParentIndentLevel; // How much to change indent by
	const changes: EditorChange[] = [];

	childrenNumbers.forEach((lineNumber) => {
		const line = editor.getLine(lineNumber);
		const newIndentLevel = Math.max(
			countIndentLevel(line, tabSize) + indentDelta,
			0,
		);

		const matchResult = line.match(
			/^(?<whitespace>\s*)(?<bullet>[-*]\s*|(?<numbered>\d+\.\s*))(?<heading>#+\s*)?(?<content>.*)$/,
		);

		const tabsMarkers = "\t".repeat(newIndentLevel);
		const bulletMarkers = matchResult?.groups?.bullet || "";
		const numberedMarkers = matchResult?.groups?.numbered || "";
		const listMarker = bulletMarkers || numberedMarkers;
		const headingMarkers = match({
			heading: matchResult?.groups?.heading,
			changeHeadingLevel,
		})
			.with({ heading: undefined, changeHeadingLevel: P._ }, () => "")
			.with(
				{ heading: P._, changeHeadingLevel: true },
				() => `${"#".repeat(Math.min(newIndentLevel + 1, 6))} `,
			)
			.with(
				{ heading: P._, changeHeadingLevel: P.not(true) },
				({ heading }) => heading,
			)
			.exhaustive();
		const content = matchResult?.groups?.content || "";

		const newLine = `${tabsMarkers}${listMarker}${headingMarkers}${content}`;
		const change = computeLineChange(lineNumber, line, newLine);
		if (change) {
			changes.push(change);
		}
	});

	return changes;
};

/** Map selections according to line changes, ensuring cursor at column 0 moves
 * after inserted prefix (e.g. "|aaa" -> "## |aaa", "|" -> "## |"). */
export const mapSelectionPositions = (
	selections: EditorSelection[],
	changes: EditorChange[],
): EditorSelection[] => {
	const changesByLine = new Map<number, EditorChange>();
	for (const change of changes) {
		changesByLine.set(change.from.line, change);
	}

	const mapPos = (pos: EditorPosition): EditorPosition => {
		const change = changesByLine.get(pos.line);
		if (!change) return pos;

		const fromCh = change.from.ch;
		const toCh = change.to?.ch ?? fromCh;
		const insertedLen = change.text.length;
		const deletedLen = toCh - fromCh;
		const delta = insertedLen - deletedLen;

		if (pos.ch < fromCh) {
			return pos;
		}
		if (pos.ch > toCh) {
			return { line: pos.line, ch: pos.ch + delta };
		}
		// Inside or on the boundary of the replaced range (e.g. cursor at column 0 when inserting prefix)
		return { line: pos.line, ch: fromCh + insertedLen };
	};

	return selections.map((sel) => ({
		anchor: mapPos(sel.anchor),
		head: mapPos(sel.head),
	}));
};

/** Apply changes to editor while explicitly preserving and updating selections. */
export const applyChangesWithSelectionTracking = (
	editor: MinimumEditor,
	changes: EditorChange[],
): void => {
	if (!changes.length) return;
	const currentSelections = editor.listSelections();
	const mappedSelections = mapSelectionPositions(currentSelections, changes);
	const transactionSelections: EditorRangeOrCaret[] = mappedSelections.map(
		(sel) => ({
			from: sel.anchor,
			to: sel.head,
		}),
	);

	editor.transaction({
		changes,
		selections: transactionSelections,
	});
};
