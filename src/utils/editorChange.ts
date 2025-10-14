import type { Editor, EditorChange, EditorPosition } from "obsidian";
import type { HeadingShifterSettings } from "settings";
import { type ModifierKey, simulateHotkey } from "./event";
import {
	countLeadingTabs,
	getBulletedNeedsOutdentLines as getBulletedNeedsSyncLines,
	getNeedsOutdentLines,
} from "./markdown";

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


export const execSyncBulletIndent = (
	startLineNumber: number,
	startPrevIndentLevel: number,
	headingSize: number,
	editor: Editor,
): EditorChange[] => {
	const lineNumbers = getBulletedNeedsSyncLines(
		startLineNumber,
		startPrevIndentLevel,
		editor,
	);

	const indentDelta = headingSize - 1 - startPrevIndentLevel; // How much to change indent by
	const changes: EditorChange[] = [];

	lineNumbers.forEach((lineNumber) => {
		const line = editor.getLine(lineNumber);
		const newIndentLevel = Math.max(countLeadingTabs(line) + indentDelta, 0);

		const match = line.match(
			/^(?<whitespace>\s*)(?<bullet>[-*]\s*)(?<heading>#+\s*)?(?<content>.*)$/,
		);

		const tabsMarkers = "\t".repeat(newIndentLevel);
		const bulletMarkers = match?.groups?.bullet || "";
		const headingMarkers = match?.groups?.heading
			? "#".repeat(Math.min(newIndentLevel + 1, 6)) + " "
			: "";
		const content = match?.groups?.content || "";

		const newLine = `${tabsMarkers}${bulletMarkers}${headingMarkers}${content}`;

		changes.push({
			text: newLine,
			from: { line: lineNumber, ch: 0 },
			to: { line: lineNumber, ch: line.length },
		});
	});

	return changes;
};
