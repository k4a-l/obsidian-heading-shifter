import { EditorChange } from "obsidian";
import { HeadingShifterSettings } from "settings";

export const composeLineChanges = (
	editor: { getLine: (number: number) => string },
	lineNumbers: number[],
	changeCallback: (chunk: string, settings?: HeadingShifterSettings) => string,
	settings?: HeadingShifterSettings
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
