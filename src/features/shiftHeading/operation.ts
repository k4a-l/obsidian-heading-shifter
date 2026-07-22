import { type Command, type Editor, Notice } from "obsidian";
import type { HeadingShifterSettings } from "settings";
import type { EditorOperation } from "types/editorOperation";
import type { StopPropagation } from "types/type";
import { composeLineChanges, type MinimumEditor } from "utils/editorChange";
import { getHeadingLines } from "utils/markdown";
import { selectionsToLineBlocks } from "utils/range";
import { decreaseHeading, increaseHeading } from "./module";

/** Whether any selected block (across scattered selections) contains a heading.
 * Used by `check` to decide if Tab / Shift-Tab should be intercepted — the same
 * block scan the shift itself uses, so the keybinding gate and the action agree. */
const selectionHasHeading = (editor: MinimumEditor): boolean =>
	selectionsToLineBlocks(editor.listSelections()).some(
		(block) =>
			getHeadingLines(editor, block.start, block.end).maxHeading !== undefined,
	);

export class IncreaseHeading implements EditorOperation {
	settings: HeadingShifterSettings;
	includesNoHeadingsLine: boolean;
	constructor(
		settings: HeadingShifterSettings,
		includesNoHeadingsLine: boolean,
	) {
		this.settings = settings;
		this.includesNoHeadingsLine = includesNoHeadingsLine;
	}

	editorCallback = (editor: MinimumEditor): StopPropagation => {
		const blocks = selectionsToLineBlocks(editor.listSelections());

		// Get the lines that contain heading, per block
		const perBlock = blocks.map((block) =>
			getHeadingLines(editor, block.start, block.end, {
				includesNoHeadingsLine: this.includesNoHeadingsLine,
			}),
		);

		// Do not increase if any block contains more than heading 6.
		if (
			perBlock.some(
				({ maxHeading }) => maxHeading !== undefined && maxHeading >= 6,
			)
		) {
			new Notice("Cannot increase (contains more than heading 6)");
			return true;
		}

		const isOneLine =
			blocks.length === 1 && blocks[0]?.start === blocks[0]?.end;

		// Dispatch Transaction
		const editorChange = perBlock.flatMap(({ headingLines }) =>
			composeLineChanges(editor, headingLines, increaseHeading, this.settings),
		);
		editor.transaction({
			changes: editorChange,
		});

		// Since SHIFT is for items that already have a HEADING, it does not do `execOutdent`.

		// If only one line is targeted, move the cursor to the end of the line.
		if (isOneLine) {
			editor.setCursor(editor.getCursor("anchor").line);
		}
		return !!editorChange.length;
	};

	createCommand = (): Command => {
		return {
			id: `increase-heading${this.includesNoHeadingsLine ? "-forced" : ""}`,
			name: `Increase headings${this.includesNoHeadingsLine ? "(forced)" : ""}`,
			icon: "headingShifter_increaseIcon",
			editorCallback: this.editorCallback,
		};
	};

	check = (editor: Editor): boolean => {
		// Disable if the selection has no heading, so as not to interfere with
		// tables or other Tab behavior.
		if (!selectionHasHeading(editor)) return false;
		return this.settings.overrideTab;
	};
}

export class DecreaseHeading implements EditorOperation {
	settings: HeadingShifterSettings;
	constructor(settings: HeadingShifterSettings) {
		this.settings = settings;
	}
	editorCallback = (editor: MinimumEditor) => {
		const blocks = selectionsToLineBlocks(editor.listSelections());

		// Get the lines that contain heading, per block
		const perBlock = blocks.map((block) =>
			getHeadingLines(editor, block.start, block.end),
		);

		// Do not decrease if any block contains less than the configured heading.
		if (
			perBlock.some(
				({ minHeading }) =>
					minHeading !== undefined &&
					minHeading <= Number(this.settings.limitHeadingFrom),
			)
		) {
			new Notice(
				`Cannot Decrease (contains less than Heading${Number(
					this.settings.limitHeadingFrom,
				)})`,
			);
			return true;
		}

		const isOneLine =
			blocks.length === 1 && blocks[0]?.start === blocks[0]?.end;

		// Dispatch Transaction
		const editorChange = perBlock.flatMap(({ headingLines }) =>
			composeLineChanges(editor, headingLines, decreaseHeading, this.settings),
		);
		editor.transaction({
			changes: editorChange,
		});

		// If only one line is targeted, move the cursor to the end of the line.
		if (isOneLine) {
			editor.setCursor(editor.getCursor("anchor").line);
		}
		return !!editorChange.length;
	};

	createCommand = () => {
		return {
			id: "decrease-heading",
			name: "Decrease headings",
			icon: "headingShifter_decreaseIcon",
			editorCallback: this.editorCallback,
		};
	};

	check = (editor: Editor): boolean => {
		// Disable if the selection has no heading, so as not to interfere with
		// tables or other Tab behavior.
		if (!selectionHasHeading(editor)) return false;
		return this.settings.overrideTab;
	};
}
