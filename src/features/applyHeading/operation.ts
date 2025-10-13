import type { Command, Editor } from "obsidian";
import type { HeadingShifterSettings } from "settings";
import type { EditorOperation } from "types/editorOperation";
import type { StopPropagation } from "types/type";
import {
	composeLineChanges,
	execOutdent,
	execSyncBulletIndent
} from "utils/editorChange";
import { countLeadingTabs } from "utils/markdown";
import { createRange } from "utils/range";
import { applyHeading } from "./module";

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

		const lastHeaderLineNumber = lines[lines.length - 1];
		const lastLine = editor.getLine(lastHeaderLineNumber);
		const lastHeaderPrevIndentLevel = countLeadingTabs(lastLine);
		const isBulleted = /^\s*[-*]\s+/.test(lastLine);

		// Dispatch Transaction
		editor.transaction({
			changes: composeLineChanges(editor, lines, (chunk: string) =>
				applyHeading(chunk, this.headingSize, this.settings),
			),
		});

		if (
			this.settings.autoOutdent.enable &&
			this.settings.syncHeadingsAndListsLevel &&
			isBulleted
		) {
			// Apply outdent to the bulleted lines to match the new heading level
			// Start from the last line headers are applied to and check from there
			const bulletedChanges = execSyncBulletIndent(
				lastHeaderLineNumber,
				lastHeaderPrevIndentLevel,
				this.headingSize,
				editor
			);

			editor.transaction({
				changes: bulletedChanges,
			});
		} else {
			execOutdent(Math.max(...lines) + 1, editor, this.settings);
		}

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
