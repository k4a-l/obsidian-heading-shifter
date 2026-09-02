import type { Command } from "obsidian";
import type { HeadingShifterSettings } from "settings";
import type { EditorOperation } from "types/editorOperation";
import type { StopPropagation } from "types/type";
import { HEADING_ICONS, ICONS } from "ui/icon";
import {
	applyChangesWithSelectionTracking,
	combineHeadingAndIndentChanges,
	composeLineChanges,
	type MinimumEditor,
} from "utils/editorChange";
import { createRange, selectionsToLineBlocks } from "utils/range";
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
	editorCallback = (editor: MinimumEditor): StopPropagation => {
		const blocks = selectionsToLineBlocks(editor.listSelections());

		const headingsChanges = blocks.flatMap((block) => {
			const lines = createRange(block.start, block.end - block.start + 1);
			return composeLineChanges(editor, lines, (chunk) =>
				applyHeading(chunk, this.headingSize, this.settings),
			);
		});

		const indentChanges = blocks.flatMap((block) =>
			createListIndentChangesByListBehavior(editor, {
				parentIndentLevel: this.headingSize - 1,
				tabSize: this.settings.editor.tabSize,
				listBehavior: this.settings.list.childrenBehavior,
				parentLineNumber: block.end,
			}),
		);

		applyChangesWithSelectionTracking(
			editor,
			combineHeadingAndIndentChanges(headingsChanges, indentChanges),
		);

		return true;
	};

	createCommand = (): Command => {
		const icon = HEADING_ICONS[this.headingSize]?.id ?? ICONS.heading0.id;
		return {
			id: `apply-heading${this.headingSize}`,
			name: `Apply heading ${this.headingSize}`,
			icon,
			editorCallback: this.editorCallback,
		};
	};

	check = (): boolean => {
		return this.settings.overrideTab;
	};
}
