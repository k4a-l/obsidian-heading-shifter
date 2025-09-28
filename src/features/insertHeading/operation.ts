import { applyHeading } from "features/applyHeading";
import { type Command, type Editor, Notice } from "obsidian";
import type { HeadingShifterSettings } from "settings";
import type { EditorOperation } from "types/editorOperation";
import type { StopPropagation } from "types/type";
import { composeLineChanges, execOutdent } from "utils/editorChange";
import { checkHeading, getPreviousHeading } from "utils/markdown";

export class InsertHeadingAtCurrentLevel implements EditorOperation {
	settings: HeadingShifterSettings;
	constructor(settings: HeadingShifterSettings) {
		this.settings = settings;
	}

	editorCallback = (editor: Editor): StopPropagation => {
		const cursorLine = editor.getCursor("from").line;
		const lastHeadingLine = getPreviousHeading(editor, cursorLine);

		// current heading level == most recently added heading
		// 0 if no heading exists yet
		const headingLevel =
			lastHeadingLine !== undefined
				? checkHeading(editor.getLine(lastHeadingLine))
				: 0;

		editor.transaction({
			changes: composeLineChanges(editor, [cursorLine], (chunk: string) =>
				applyHeading(chunk, headingLevel, this.settings),
			),
		});

		execOutdent(cursorLine + 1, editor, this.settings);

		editor.setCursor(editor.getCursor().line);
		return true;
	};

	createCommand = (): Command => {
		return {
			id: `insert-heading-current`,
			name: `Insert Heading at current level`,
			icon: `headingShifter_heading`,
			editorCallback: this.editorCallback,
		};
	};
}

export class InsertHeadingAtDeeperLevel implements EditorOperation {
	settings: HeadingShifterSettings;
	constructor(settings: HeadingShifterSettings) {
		this.settings = settings;
	}

	editorCallback = (editor: Editor): StopPropagation => {
		const cursorLine = editor.getCursor("from").line;
		const lastHeadingLine = getPreviousHeading(editor, cursorLine);

		// current heading level == most recently added heading
		// 0 if no heading exists yet
		const headingLevel = lastHeadingLine
			? checkHeading(editor.getLine(lastHeadingLine))
			: 0;

		if (headingLevel + 1 > 6) {
			new Notice("Cannot Increase (contains more than Heading 6)");
			return true;
		}

		editor.transaction({
			changes: composeLineChanges(editor, [cursorLine], (chunk: string) =>
				applyHeading(chunk, headingLevel + 1, this.settings),
			),
		});

		execOutdent(cursorLine + 1, editor, this.settings);

		editor.setCursor(editor.getCursor().line);
		return true;
	};

	createCommand = (): Command => {
		return {
			id: `insert-heading-deeper`,
			name: `Insert Heading at one level deeper`,
			icon: `headingShifter_heading`,
			editorCallback: this.editorCallback,
		};
	};
}

export class InsertHeadingAtHigherLevel implements EditorOperation {
	settings: HeadingShifterSettings;
	constructor(settings: HeadingShifterSettings) {
		this.settings = settings;
	}

	editorCallback = (editor: Editor): StopPropagation => {
		const cursorLine = editor.getCursor("from").line;
		const lastHeadingLine = getPreviousHeading(editor, cursorLine);

		// current heading level == most recently added heading
		// 0 if no heading exists yet
		const headingLevel = lastHeadingLine
			? checkHeading(editor.getLine(lastHeadingLine))
			: 0;

		editor.transaction({
			changes: composeLineChanges(editor, [cursorLine], (chunk: string) =>
				applyHeading(chunk, headingLevel - 1, this.settings),
			),
		});

		execOutdent(cursorLine + 1, editor, this.settings);

		editor.setCursor(editor.getCursor().line);
		return true;
	};

	createCommand = (): Command => {
		return {
			id: `insert-heading-higher`,
			name: `Insert Heading at one level higher`,
			icon: `headingShifter_heading`,
			editorCallback: this.editorCallback,
		};
	};
}
