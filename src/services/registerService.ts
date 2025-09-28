import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { ApplyHeading } from "features/applyHeading";
import {
	InsertHeadingAtCurrentLevel,
	InsertHeadingAtDeeperLevel,
	InsertHeadingAtHigherLevel,
} from "features/insertHeading";
import { DecreaseHeading, IncreaseHeading } from "features/shiftHeading";
import type HeadingShifter from "main";
import { HEADINGS } from "types/type";

export class RegisterService {
	plugin: HeadingShifter;

	constructor(plugin: HeadingShifter) {
		this.plugin = plugin;
	}

	exec() {
		this.addCommands();
	}

	addCommands() {
		const increaseHeading = new IncreaseHeading(this.plugin.settings, false);
		const increaseHeadingForced = new IncreaseHeading(
			this.plugin.settings,
			true,
		);
		const decreaseHeading = new DecreaseHeading(this.plugin.settings);
		const insertHeadingAtCurrentLabel = new InsertHeadingAtCurrentLevel(
			this.plugin.settings,
		);
		const insertHeadingAtDeeperLevel = new InsertHeadingAtDeeperLevel(
			this.plugin.settings,
		);
		const insertHeadingAtHigherLevel = new InsertHeadingAtHigherLevel(
			this.plugin.settings,
		);

		HEADINGS.forEach((heading) => {
			const applyHeading = new ApplyHeading(this.plugin.settings, heading);
			this.plugin.addCommand(applyHeading.createCommand());
		});
		this.plugin.addCommand(increaseHeading.createCommand());
		this.plugin.addCommand(increaseHeadingForced.createCommand());
		this.plugin.addCommand(decreaseHeading.createCommand());
		this.plugin.addCommand(insertHeadingAtCurrentLabel.createCommand());
		this.plugin.addCommand(insertHeadingAtDeeperLevel.createCommand());
		this.plugin.addCommand(insertHeadingAtHigherLevel.createCommand());

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
