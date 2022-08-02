import { Editor, MarkdownView } from "obsidian";
import { HeadingShifterSettings } from "settings";
import { applyHeading } from "./module";

const dispatchApplyHeading = (
	editor: Editor,
	view: MarkdownView,
	heading: number
) => {
	const line = editor.getCursor().line;
	const lineContent = editor.getLine(line);

	editor.replaceRange(
		applyHeading(lineContent, heading),
		{ line, ch: 0 },
		{ line, ch: lineContent.length }
	);
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
			dispatchApplyHeading(editor, view, heading);
		},
	};
};
