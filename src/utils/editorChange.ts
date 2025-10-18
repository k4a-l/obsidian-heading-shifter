import { TABSIZE } from "constant/editor";
import type { EditorChange, EditorPosition } from "obsidian";
import type { HeadingShifterSettings } from "settings";
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
	}: { parentLineNumber: number; parentIndentLevel: number; tabSize?: number },
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

		const match = line.match(
			/^(?<whitespace>\s*)(?<bullet>[-*]\s*|(?<numbered>\d+\.\s*))(?<heading>#+\s*)?(?<content>.*)$/,
		);

		const tabsMarkers = "\t".repeat(newIndentLevel);
		const bulletMarkers = match?.groups?.bullet || "";
		const numberedMarkers = match?.groups?.numbered || "";
		const listMarker = bulletMarkers || numberedMarkers;
		const headingMarkers = match?.groups?.heading
			? "#".repeat(Math.min(newIndentLevel + 1, 6)) + " "
			: "";
		const content = match?.groups?.content || "";

		const newLine = `${tabsMarkers}${listMarker}${headingMarkers}${content}`;

		changes.push({
			text: newLine,
			from: { line: lineNumber, ch: 0 },
			to: { line: lineNumber, ch: line.length },
		});
	});

	return changes;
};
