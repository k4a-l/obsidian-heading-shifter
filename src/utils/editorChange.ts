import type { EditorChange, EditorPosition, Editor } from "obsidian";
import type { HeadingShifterSettings } from "settings";
import { type ModifierKey, simulateHotkey } from "./event";
import { getNeedsOutdentLines, countLeadingTabs, getBulletedNeedsOutdentLines } from "./markdown";

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
	if (!settings.autoOutdent.enable || settings.syncHeadingsAndListsLevel)
		return;

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

export const execBulletedOutdent = (startLineNumber: number,
	startPrevIndentLevel: number,
	headingSize: number,
	editor: Editor
) => {
  const lineNumbers = getBulletedNeedsOutdentLines(startLineNumber, startPrevIndentLevel, editor);

  const indentDelta = (headingSize - 1) - startPrevIndentLevel; // How much to change indent by
  const changes: { text: string; from: EditorPosition; to: EditorPosition }[] = [];

  lineNumbers.forEach(lineNumber => {
    const line = editor.getLine(lineNumber);
    const newIndentLevel = Math.max(countLeadingTabs(line) + indentDelta, 0);
    
    const match = line.match(/^(\s*)([-*]\s*)(#+\s*)?(.*)$/);
    // match[1]: leading whitespace
    // match[2]: bullet marker ("- " or "* ")
    // match[3]: heading markers (e.g. "## " or undefined)
    // match[4]: rest of the line (actual content)

    const tabsMarkers = "\t".repeat(newIndentLevel);
    const bulletMarkers = match[2];
    const headingMarkers = match[3] ? "#".repeat(Math.min(newIndentLevel + 1, 6)) + " " : "";
    const content = match[4];

    const newLine = `${tabsMarkers}${bulletMarkers}${headingMarkers}${content}`;

    changes.push({
      text: newLine,
      from: { line: lineNumber, ch: 0 },
      to: { line: lineNumber, ch: line.length }
    });
  });

  editor.transaction({ changes })
}
