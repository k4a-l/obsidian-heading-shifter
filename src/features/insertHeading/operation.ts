import { applyHeading } from "features/applyHeading";
import { createListIndentChangesByListBehavior } from "features/applyHeading/module";
import { type Command, type EditorChange, Notice } from "obsidian";
import type { HeadingShifterSettings } from "settings";
import type { EditorOperation } from "types/editorOperation";
import type { StopPropagation } from "types/type";
import {
	combineHeadingAndIndentChanges,
	composeLineChanges,
	type MinimumEditor,
} from "utils/editorChange";
import { getPreviousHeadingLevel } from "utils/markdown";
import {
	createRange,
	type LineBlock,
	selectionsToLineBlocks,
} from "utils/range";

type InsertHeadingLevels = {
	/** Target heading level for a line, from the line's previous heading level. */
	toTargetLevel: (previousHeadingLevel: number) => number;
	/** Indent level for the block's list children, from the target level. */
	toParentIndentLevel: (targetLevel: number) => number;
};

/** Build the changes for inserting headings across whole selection blocks.
 * Each block takes ONE level, from the heading before the block (its section),
 * applied uniformly to every line in the block — so the selection follows the
 * surrounding section, headings inside the block are re-leveled to match, and
 * scattered blocks each follow their own section. Returns `exceedsMax` when any
 * block's target would go past heading 6, in which case no change is made. */
const createInsertHeadingChanges = (
	editor: MinimumEditor,
	blocks: LineBlock[],
	settings: HeadingShifterSettings,
	{ toTargetLevel, toParentIndentLevel }: InsertHeadingLevels,
): { changes: EditorChange[]; exceedsMax: boolean } => {
	const blockTargets = blocks.map((block) => ({
		block,
		// Insert always produces a heading, so clamp to at least H1 (e.g. `current`
		// / `higher` in a section-less context, or `higher` under H1).
		level: Math.max(
			1,
			toTargetLevel(getPreviousHeadingLevel(editor, block.start)),
		),
	}));

	if (blockTargets.some(({ level }) => level > 6)) {
		return { changes: [], exceedsMax: true };
	}

	const headingChanges = blockTargets.flatMap(({ block, level }) =>
		composeLineChanges(
			editor,
			createRange(block.start, block.end - block.start + 1),
			(chunk) => applyHeading(chunk, level, settings),
		),
	);

	// Indent only the last line of each block (like ApplyHeading) so overlapping
	// list children in a range are not adjusted more than once.
	const indentChanges = blockTargets.flatMap(({ block, level }) =>
		createListIndentChangesByListBehavior(editor, {
			parentIndentLevel: toParentIndentLevel(level),
			tabSize: settings.editor.tabSize,
			listBehavior: settings.list.childrenBehavior,
			parentLineNumber: block.end,
		}),
	);

	return {
		changes: combineHeadingAndIndentChanges(headingChanges, indentChanges),
		exceedsMax: false,
	};
};

/** Insert a heading across every selection (including scattered multi-cursors),
 * treating each selection as a full line range. */
const insertHeadingAtSelections = (
	editor: MinimumEditor,
	settings: HeadingShifterSettings,
	levels: InsertHeadingLevels,
): StopPropagation => {
	const blocks = selectionsToLineBlocks(editor.listSelections());
	const { changes, exceedsMax } = createInsertHeadingChanges(
		editor,
		blocks,
		settings,
		levels,
	);

	if (exceedsMax) {
		new Notice("Cannot increase (contains more than heading 6)");
		return true;
	}

	editor.transaction({ changes });

	// If a single line is targeted, place the cursor there (typing usually
	// follows). Consistent with ApplyHeading / shift; multi-block leaves the
	// selections to the transaction.
	if (blocks.length === 1 && blocks[0]?.start === blocks[0]?.end) {
		editor.setCursor(editor.getCursor("anchor").line);
	}
	return true;
};

export class InsertHeadingAtCurrentLevel implements EditorOperation {
	settings: HeadingShifterSettings;
	constructor(settings: HeadingShifterSettings) {
		this.settings = settings;
	}

	editorCallback = (editor: MinimumEditor): StopPropagation =>
		insertHeadingAtSelections(editor, this.settings, {
			toTargetLevel: (previousHeadingLevel: number) => previousHeadingLevel,
			toParentIndentLevel: (targetLevel: number) => targetLevel - 1,
		});

	createCommand = (): Command => {
		return {
			id: `insert-heading-current`,
			name: `Insert heading at current level`,
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

	editorCallback = (editor: MinimumEditor): StopPropagation =>
		insertHeadingAtSelections(editor, this.settings, {
			toTargetLevel: (previousHeadingLevel: number) => previousHeadingLevel + 1,
			toParentIndentLevel: (targetLevel: number) => targetLevel - 1,
		});

	createCommand = (): Command => {
		return {
			id: `insert-heading-deeper`,
			name: `Insert heading at one level deeper`,
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

	editorCallback = (editor: MinimumEditor): StopPropagation =>
		insertHeadingAtSelections(editor, this.settings, {
			toTargetLevel: (previousHeadingLevel: number) => previousHeadingLevel - 1,
			toParentIndentLevel: (targetLevel: number) => targetLevel,
		});

	createCommand = (): Command => {
		return {
			id: `insert-heading-higher`,
			name: `Insert heading at one level higher`,
			icon: `headingShifter_heading`,
			editorCallback: this.editorCallback,
		};
	};
}
