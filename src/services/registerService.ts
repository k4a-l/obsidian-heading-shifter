import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { ApplyHeading } from "features/applyHeading";
import { OpenHeadingMenu } from "features/headingMenu";
import {
	InsertHeadingAtCurrentLevel,
	InsertHeadingAtDeeperLevel,
	InsertHeadingAtHigherLevel,
} from "features/insertHeading";
import { DecreaseHeading, IncreaseHeading } from "features/shiftHeading";
import type HeadingShifter from "main";
import type { Command } from "obsidian";
import type { StopPropagation } from "types/type";
import { HEADINGS } from "types/type";
import type { MinimumEditor } from "utils/editorChange";

type EditorOperationLike = {
	createCommand: () => Command;
	editorCallback: (editor: MinimumEditor) => StopPropagation;
};

export class RegisterService {
	plugin: HeadingShifter;

	constructor(plugin: HeadingShifter) {
		this.plugin = plugin;
	}

	exec() {
		// Create operations
		const increaseHeading = new IncreaseHeading(this.plugin.settings);
		const increaseHeadingForced = new IncreaseHeading(this.plugin.settings, {
			includesNoHeadingsLine: true,
		});
		const increaseHeadingWithSubheadings = new IncreaseHeading(
			this.plugin.settings,
			{ withSubHeadings: true },
		);
		const decreaseHeading = new DecreaseHeading(this.plugin.settings);
		const decreaseHeadingWithSubheadings = new DecreaseHeading(
			this.plugin.settings,
			{ withSubHeadings: true },
		);
		const insertHeadingAtCurrentLabel = new InsertHeadingAtCurrentLevel(
			this.plugin.settings,
		);
		const insertHeadingAtDeeperLevel = new InsertHeadingAtDeeperLevel(
			this.plugin.settings,
		);
		const insertHeadingAtHigherLevel = new InsertHeadingAtHigherLevel(
			this.plugin.settings,
		);
		const applyHeadings = HEADINGS.map(
			(heading) => new ApplyHeading(this.plugin.settings, heading),
		);

		// Register commands
		this.addCommands([
			...applyHeadings,
			insertHeadingAtCurrentLabel,
			insertHeadingAtDeeperLevel,
			insertHeadingAtHigherLevel,
			increaseHeading,
			increaseHeadingForced,
			increaseHeadingWithSubheadings,
			decreaseHeading,
			decreaseHeadingWithSubheadings,
		]);

		// Register Tab / Shift-Tab keymaps
		this.registerTabKeyMap(increaseHeading, decreaseHeading);
	}

	/** Register each operation as its own command, plus one menu command listing all of them. */
	addCommands(operations: EditorOperationLike[]) {
		const commands = operations.map((operation) => ({
			...operation.createCommand(),
			editorCallback: operation.editorCallback,
		}));

		// addCommand mutates the object it's given (it prefixes `name` with the
		// plugin name), so the menu keeps its own copy of the original names.
		const menuCommands = commands.map((command) => ({ ...command }));

		commands.forEach((command) => {
			// 検索時は先頭一致 > 文字列長 > の順番でソートされるらしい なので登録順とかアルファベット順は尊重されない
			this.plugin.addCommand(command);
		});

		const openHeadingMenu = new OpenHeadingMenu(menuCommands);
		this.plugin.addCommand(openHeadingMenu.createCommand());
	}

	registerTabKeyMap(
		increaseHeading: IncreaseHeading,
		decreaseHeading: DecreaseHeading,
	) {
		this.plugin.registerEditorExtension(
			Prec.highest(
				keymap.of([
					{
						key: "Tab",
						run: this.plugin.obsidianService.createKeyMapRunCallback({
							check: increaseHeading.check,
							run: increaseHeading.editorCallback,
						}),
					},
				]),
			),
		);

		this.plugin.registerEditorExtension(
			Prec.highest(
				keymap.of([
					{
						key: "s-Tab",
						run: this.plugin.obsidianService.createKeyMapRunCallback({
							check: decreaseHeading.check,
							run: decreaseHeading.editorCallback,
						}),
					},
				]),
			),
		);
	}
}
