import { Command, Editor } from "obsidian";
import { HeadingShifterSettings } from "settings";
import { composeLineChanges } from "utils/editorChange";
import { createRange } from "utils/range";
import { applyHeading } from "./module";

/** Return obsidian command object : apply heading
 * @params setting - plugin settins(Not in use now)
 * @params headingSize - The Heading Size to be applied
 */

export const createApplyHeadingCommand = (
	setting: HeadingShifterSettings,
	headingSize: number
): Command => {
	const createEditorCallback = (heading: number) => {
		return (editor: Editor) => {
			const lines = createRange(
				editor.getCursor("from").line,
				editor.getCursor("to").line - editor.getCursor("from").line + 1
			);

			const isOneline =
				editor.getCursor("from").line === editor.getCursor("to").line;

			// Dispatch Transaction
			editor.transaction({
				changes: composeLineChanges(editor, lines, (chunk: string) =>
					applyHeading(chunk, heading)
				),
			});

            // If only one line is targeted, move the cursor to the end of the line.
			if (isOneline) {
				editor.setCursor(editor.getCursor("anchor").line);
			}
		};
	};

	// return command object
	return {
		id: `apply-heading${headingSize}`,
		name: `Apply Heading ${headingSize}`,
		icon: `headingShifter_heading${headingSize}`,
		editorCallback: createEditorCallback(headingSize),
	};
};
