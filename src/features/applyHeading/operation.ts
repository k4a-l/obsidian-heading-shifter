import { Editor, EditorChange, MarkdownView } from "obsidian";
import { HeadingShifterSettings } from "settings";
import { applyHeading } from "./module";

const composeApplyHeadingChanges = (
	editor: Editor,
	view: MarkdownView,
	heading: number
): EditorChange[] => {
	const line = editor.getCursor().line;
	const lineContent = editor.getLine(line);

	return [
		{
			text: applyHeading(lineContent, heading),
			from: { line, ch: 0 },
			to: { line, ch: lineContent.length },
		},
	];
};

export const createApplyHeadingCommand = (
	setting: HeadingShifterSettings,
	heading: number
) => {
	return {
		id: `apply-heading${heading}`,
		name: `Apply Heading ${heading}`,
		editorCallback: (editor: Editor, view: MarkdownView) => {
			if (editor.getCursor("from").line! != editor.getCursor("to").line) {
				return;
			}

			editor.transaction({
				changes: composeApplyHeadingChanges(editor, view, heading),
			});
		},
	};
};
