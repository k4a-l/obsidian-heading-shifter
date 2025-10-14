import type { Command, Editor } from "obsidian";
import type { HeadingShifterSettings } from "settings";
import type { EditorOperation } from "types/editorOperation";
import type { StopPropagation } from "types/type";
import { composeLineChanges } from "utils/editorChange";
import { createRange } from "utils/range";
import { applyHeading, createListIndentChangesByListBehavior } from "./module";

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
			editor.getCursor("to").line - editor.getCursor("from").line + 1,
		);

		const isOneLine =
			editor.getCursor("from").line === editor.getCursor("to").line;

		const lastHeaderLineNumber = lines[lines.length - 1] ?? 0;

		const headingsChanges = composeLineChanges(editor, lines, (chunk) =>
			applyHeading(chunk, this.headingSize, this.settings),
		);

		const indentChanges = createListIndentChangesByListBehavior(editor, {
			parentIndentLevel: this.headingSize - 1,
			tabSize: this.settings.editor.tabSize,
			listBehavior: this.settings.list.childrenBehavior,
			parentLineNumber: lastHeaderLineNumber,
		});

		editor.transaction({
			changes: [...headingsChanges, ...indentChanges],
		});

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
