import { Command, Editor } from "obsidian";
import { HeadingShifterSettings } from "settings";
import { composeLineChanges, execOutdent } from "utils/editorChange";
import { createRange } from "utils/range";
import { applyHeading } from "./module";
import { EditorOperation } from "types/editorOperation";
import { StopPropagation } from "types/type";

export class ApplyHeading implements EditorOperation {
	settings: HeadingShifterSettings;
	headingSize: number;

	constructor(settings: HeadingShifterSettings, headingSize: number) {
		this.settings = settings;
		this.headingSize = headingSize;
	}

	/** Return obsidian command object : apply heading
	 * @params setting - plugin settings(Not in use now)
	 * @params headingSize - The Heading Size to be applied
	 */
	editorCallback = (editor: Editor): StopPropagation => {
		const lines = createRange(
			editor.getCursor("from").line,
			editor.getCursor("to").line - editor.getCursor("from").line + 1
		);

		const isOneLine =
			editor.getCursor("from").line === editor.getCursor("to").line;

		// Dispatch Transaction
		editor.transaction({
			changes: composeLineChanges(editor, lines, (chunk: string) =>
				applyHeading(chunk, this.headingSize, this.settings)
			),
		});

		execOutdent(Math.max(...lines) + 1, editor, this.settings);

		// If only one line is targeted, move the cursor to the end of the line.
		if (isOneLine) {
			editor.setCursor(editor.getCursor("anchor").line);
		}
		return true;
	};

	createCommand = (): Command => {
		return {
			id: `apply-heading${this.headingSize}`,
			name: `Apply Heading ${this.headingSize}`,
			icon: `headingShifter_heading${this.headingSize}`,
			editorCallback: this.editorCallback,
		};
	};

	check = (): boolean => {
		return this.settings.overrideTab;
	};
}
