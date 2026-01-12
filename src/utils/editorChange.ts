import { TABSIZE } from "constant/editor";
import type { EditorChange, EditorPosition } from "obsidian";
import type { HeadingShifterSettings } from "settings";
import { match, P } from "ts-pattern";
import { countIndentLevel, getListChildrenLines } from "./markdown";

export type MinimumEditor = {
	getLine: (number: number) => string;
	lineCount: () => number;
	setSelection: (anchor: EditorPosition, head?: EditorPosition) => void;
	getCursor(string?: "from" | "to" | "head" | "anchor"): EditorPosition;
};

export const composeLineChanges = (
	editor: MinimumEditor,
	lineNumbers: number[],
	changeCallback: (chunk: string, settings?: HeadingShifterSettings) => string,
	settings?: HeadingShifterSettings,
) => {
	const editorChange: EditorChange[] = [];

	for (const line of lineNumbers) {
		const shifted = changeCallback(editor.getLine(line), settings);

		editorChange.push({
			text: shifted,
			from: { line: line, ch: 0 },
			to: {
				line: line,
				ch: editor.getLine(line).length,
			},
		});
	}

	return editorChange;
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

		changes.push({
			text: newLine,
			from: { line: lineNumber, ch: 0 },
			to: { line: lineNumber, ch: line.length },
		});
	});

	return changes;
};
