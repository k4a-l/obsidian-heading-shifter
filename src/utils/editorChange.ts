import type { EditorChange, EditorPosition } from "obsidian";
import type { HeadingShifterSettings } from "settings";
import { type ModifierKey, simulateHotkey } from "./event";
import { getNeedsOutdentLines } from "./markdown";

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

export const execOutdent = (
	startLineNumber: number,
	editor: MinimumEditor,
	settings: HeadingShifterSettings,
) => {
	if (!settings.autoOutdent.enable || settings.autoIndentBulletedHeader) return;

	// save current selection
	const currentSelection = {
		head: editor.getCursor("head"),
		anchor: editor.getCursor("anchor"),
	};

	// get lines that needs to be outdent
	const lineNumbers = getNeedsOutdentLines(startLineNumber, editor);
	if (lineNumbers.length === 0) return;

	// set target selection
	editor.setSelection(
		{ line: Math.min(...lineNumbers), ch: 0 },
		{
			line: Math.max(...lineNumbers),
			ch: editor.getLine(Math.max(...lineNumbers)).length,
		},
	);

	// execute outdent
	const modifiers: ModifierKey[] = [];
	if (settings.autoOutdent.hotKey.shift) modifiers.push("Shift");
	if (settings.autoOutdent.hotKey.ctrl) modifiers.push("Ctrl");
	if (settings.autoOutdent.hotKey.alt) modifiers.push("Alt");
	simulateHotkey(settings.autoOutdent.hotKey.key, modifiers);

	// check need again
	const lineNumbersAfter = getNeedsOutdentLines(startLineNumber, editor);
	if (lineNumbersAfter.length === 0) {
		editor.setSelection(currentSelection.anchor, currentSelection.head);
		return;
	}

	// execute again
	execOutdent(startLineNumber, editor, settings);
};
