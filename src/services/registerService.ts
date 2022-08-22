import { createApplyHeadingCommand } from "features/applyHeading";
import { IncreaseHeading, DecreaseHeading } from "features/shiftHeading";
import HeadingShifter from "main";
import { HEADINGS } from "types/type";

import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";

export class RegisterService {
	plugin: HeadingShifter;

	constructor(plugin: HeadingShifter) {
		this.plugin = plugin;
	}

	exec() {
		this.addCommands();
	}

	addCommands() {
		const increaseHeading = new IncreaseHeading(this.plugin.settings);
		const decreaseHeading = new DecreaseHeading(this.plugin.settings);

		HEADINGS.forEach((heading) =>
			this.plugin.addCommand(
				createApplyHeadingCommand(this.plugin.settings, heading)
			)
		);
		this.plugin.addCommand(increaseHeading.createCommand());
		this.plugin.addCommand(decreaseHeading.createCommand());

		this.plugin.registerEditorExtension(
			Prec.highest(
				keymap.of([
					{
						key: "Tab",
						run: this.plugin.obsidianService.createKeymapRunCallback(
							{
								check: increaseHeading.check,
								run: increaseHeading.editorCallback,
							}
						),
					},
				])
			)
		);

		this.plugin.registerEditorExtension(
			Prec.highest(
				keymap.of([
					{
						key: "s-Tab",
						run: this.plugin.obsidianService.createKeymapRunCallback(
							{
								check: decreaseHeading.check,
								run: decreaseHeading.editorCallback,
							}
						),
					},
				])
			)
		);
	}
}
