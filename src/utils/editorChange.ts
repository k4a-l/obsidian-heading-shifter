import { Editor, EditorChange } from "obsidian";

export const composeLineChanges = (
	editor: Editor,
	lines: number[],
	changeCallback: (chunk: string) => string
) => {
	const editorChange: EditorChange[] = [];

	for (const line of lines) {
		const shifted = changeCallback(editor.getLine(line));

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
