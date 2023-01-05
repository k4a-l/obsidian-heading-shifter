import { applyHeading } from "features/applyHeading";
import { Command, Editor, Notice } from "obsidian";
import { composeLineChanges } from "utils/editorChange";
import { checkHeading, getPreviousHeading } from "utils/markdown";

export const createInsertHeadingAtCurrentLevelCommand = (): Command => {
	const createEditorCallback = () => {
		return (editor: Editor) => {

			const cursorLine = editor.getCursor("from").line
			const lastHeadingLine = getPreviousHeading(editor, cursorLine)

			// current heading level == most recently added heading
			// 0 if no heading exists yet
			const headingLevel = lastHeadingLine ? checkHeading(editor.getLine(lastHeadingLine)) : 0

			editor.transaction({
				changes: composeLineChanges(editor, [cursorLine], (chunk: string) =>
					applyHeading(chunk, headingLevel)
				),
			});

			editor.setCursor(editor.getCursor().line)
			return
		};
	};

	// return command object
	return {
		id: `insert-heading-current`,
		name: `Insert Heading at current level`,
		icon: `headingShifter_heading`,
		editorCallback: createEditorCallback(),
	};
};


export const createInsertHeadingAtDeeperLevelCommand = (): Command => {
	const createEditorCallback = () => {
		return (editor: Editor) => {

			const cursorLine = editor.getCursor("from").line
			const lastHeadingLine = getPreviousHeading(editor, cursorLine)

			// current heading level == most recently added heading
			// 0 if no heading exists yet
			const headingLevel = lastHeadingLine ? checkHeading(editor.getLine(lastHeadingLine)) : 0

			if (headingLevel+1 > 6) {
				new Notice("Cannot Increase (contains more than Heading 6)");
				return true;
			}

			editor.transaction({
				changes: composeLineChanges(editor, [cursorLine], (chunk: string) =>
					applyHeading(chunk, headingLevel + 1)
				),
			});

			editor.setCursor(editor.getCursor().line)
			return
		};
	};

	// return command object
	return {
		id: `insert-heading-deeper`,
		name: `Insert Heading at one level deeper`,
		icon: `headingShifter_heading`,
		editorCallback: createEditorCallback(),
	};
};

export const createInsertHeadingAtHigherLevelCommand = (): Command => {
	const createEditorCallback = () => {
		return (editor: Editor) => {

			const cursorLine = editor.getCursor("from").line
			const lastHeadingLine = getPreviousHeading(editor, cursorLine)

			// current heading level == most recently added heading
			// 0 if no heading exists yet
			const headingLevel = lastHeadingLine ? checkHeading(editor.getLine(lastHeadingLine)) : 0

			editor.transaction({
				changes: composeLineChanges(editor, [cursorLine], (chunk: string) =>
					applyHeading(chunk, headingLevel - 1)
				),
			});

			editor.setCursor(editor.getCursor().line)
			return
		};
	};

	// return command object
	return {
		id: `insert-heading-higher`,
		name: `Insert Heading at one level higher`,
		icon: `headingShifter_heading`,
		editorCallback: createEditorCallback(),
	};
};
