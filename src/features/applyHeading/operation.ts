import { Command, Editor } from "obsidian";
import { HeadingShifterSettings } from "settings";
import { composeLineChanges } from "utils/editorChange";
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
			// Do not process if multiple lines are selected
			if (editor.getCursor("from").line! != editor.getCursor("to").line) {
				return;
			}

			// Dispatch Transaction
			editor.transaction({
				changes: composeLineChanges(
					editor,
					[editor.getCursor().line],
					(chunk: string) => applyHeading(chunk, heading)
				),
			});
		};
	};

	// return command object
	return {
		id: `apply-heading${headingSize}`,
		name: `Apply Heading ${headingSize}`,
		editorCallback: createEditorCallback(headingSize),
	};
};
