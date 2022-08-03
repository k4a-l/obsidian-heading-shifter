import { Editor, EditorChange, MarkdownView } from "obsidian";
import { HeadingShifterSettings } from "settings";
import { composeLineChanges } from "utils/editorChange";
import { applyHeading } from "./module";

export const createApplyHeadingCommand = (
	setting: HeadingShifterSettings,
	heading: number
) => {
	const createEditorCallback = (heading: number) => {
		return (editor: Editor) => {
			if (editor.getCursor("from").line! != editor.getCursor("to").line) {
				return;
			}

			editor.transaction({
				changes: composeLineChanges(
					editor,
					[editor.getCursor().line],
					(chunk: string) => applyHeading(chunk, heading)
				),
			});
		};
	};

	return {
		id: `apply-heading${heading}`,
		name: `Apply Heading ${heading}`,
		editorCallback: createEditorCallback(heading),
	};
};
