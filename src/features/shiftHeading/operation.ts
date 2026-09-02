import { type Command, type Editor, Notice } from "obsidian";
import type { HeadingShifterSettings } from "settings";
import type { EditorOperation } from "types/editorOperation";
import type { StopPropagation } from "types/type";
import { ICONS } from "ui/icon";
import {
	applyChangesWithSelectionTracking,
	composeLineChanges,
	type MinimumEditor,
} from "utils/editorChange";
import { getHeadingLines, getHeadingSubtreeLines } from "utils/markdown";
import { selectionsToLineBlocks } from "utils/range";
import { decreaseHeading, increaseHeading } from "./module";

export type ShiftHeadingOptions = {
	includesNoHeadingsLine?: boolean;
	withSubHeadings?: boolean;
};

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
	options: ShiftHeadingOptions;

	constructor(
		settings: HeadingShifterSettings,
		options: ShiftHeadingOptions = {},
	) {
		this.settings = settings;
		this.options = options;
	}

	editorCallback = (editor: MinimumEditor): StopPropagation => {
		const blocks = selectionsToLineBlocks(editor.listSelections());

		// Get the lines that contain heading, per block
		const perBlock = blocks.map((block) =>
			this.options.withSubHeadings
				? getHeadingSubtreeLines(editor, block.start, block.end)
				: getHeadingLines(editor, block.start, block.end, {
						includesNoHeadingsLine: this.options.includesNoHeadingsLine,
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

		// Dispatch Transaction
		const editorChange = perBlock.flatMap(({ headingLines }) =>
			composeLineChanges(editor, headingLines, increaseHeading, this.settings),
		);
		applyChangesWithSelectionTracking(editor, editorChange);

		// Since SHIFT is for items that already have a HEADING, it does not do `execOutdent`.
		return !!editorChange.length;
	};

	createCommand = (): Command => {
		const icon = this.options.withSubHeadings
			? ICONS.increaseWithSubheadings.id
			: this.options.includesNoHeadingsLine
				? ICONS.increaseForced.id
				: ICONS.increase.id;

		return {
			id: `increase-heading${this.options.withSubHeadings ? "-with-subheadings" : ""}${this.options.includesNoHeadingsLine ? "-forced" : ""}`,
			name: `Increase headings${this.options.withSubHeadings ? "(with sub-headings)" : ""}${this.options.includesNoHeadingsLine ? "(forced)" : ""}`,
			icon,
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
	options: ShiftHeadingOptions;

	constructor(
		settings: HeadingShifterSettings,
		options: ShiftHeadingOptions = {},
	) {
		this.settings = settings;
		this.options = options;
	}

	editorCallback = (editor: MinimumEditor) => {
		const blocks = selectionsToLineBlocks(editor.listSelections());

		// Get the lines that contain heading, per block
		const perBlock = blocks.map((block) =>
			this.options.withSubHeadings
				? getHeadingSubtreeLines(editor, block.start, block.end)
				: getHeadingLines(editor, block.start, block.end),
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

		// Dispatch Transaction
		const editorChange = perBlock.flatMap(({ headingLines }) =>
			composeLineChanges(editor, headingLines, decreaseHeading, this.settings),
		);
		applyChangesWithSelectionTracking(editor, editorChange);

		return !!editorChange.length;
	};

	createCommand = () => {
		const icon = this.options.withSubHeadings
			? ICONS.decreaseWithSubheadings.id
			: ICONS.decrease.id;

		return {
			id: `decrease-heading${this.options.withSubHeadings ? "-with-subheadings" : ""}`,
			name: `Decrease headings${this.options.withSubHeadings ? "(with sub-headings)" : ""}`,
			icon,
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
