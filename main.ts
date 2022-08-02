import { decreaseHeading, increaseHeading } from "features/shiftHeading";
import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	EditorPosition,
	EditorTransaction,
	EditorChange,
	Command,
} from "obsidian";
import { checkHeading } from "utils/checkHeading";
import { setMin, setMax } from "utils/range";

import {
	applyHeading,
	ApplyHeading,
	Heading,
} from "./src/features/applyHeading";

interface MyPluginSettings {
	limitHeadingFrom: number;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	limitHeadingFrom: 1,
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		const headings: Heading[] = [0, 1, 2, 3, 4, 5];
		headings.forEach((heading) =>
			this.addCommand(new ApplyHeading(heading).command)
		);

		const getLineRange = (editor: Editor) => {
			return {
				from: editor.getCursor("from").line,
				to: editor.getCursor("to").line,
			};
		};

		const getHeadingLines = (editor: Editor, from: number, to: number) => {
			let headingLines: { line: number; heading: number }[] = [];
			let minHeading: undefined | number = undefined;
			let maxHeading: undefined | number = undefined;

			for (
				let line = Math.min(from, to);
				line <= Math.max(from, to);
				line++
			) {
				const heading = checkHeading(editor.getLine(line));
				if (heading > 0) {
					headingLines.push({ line, heading });
					minHeading = setMin(minHeading, heading);
					maxHeading = setMax(maxHeading, heading);
				}
			}
			return { headingLines, minHeading, maxHeading };
		};

		type HeadingLine = { line: number; heading: number };

		const getHeadingShiftChanges = (
			editor: Editor,
			headingLines: HeadingLine[],
			callback: (chunk: string) => string
		) => {
			const editorChange: EditorChange[] = [];

			for (const headingLine of headingLines) {
				const shifted = callback(editor.getLine(headingLine.line));

				editorChange.push({
					text: shifted,
					from: { line: headingLine.line, ch: 0 },
					to: {
						line: headingLine.line,
						ch: editor.getLine(headingLine.line).length,
					},
				});
			}

			return editorChange;
		};

		this.addCommand({
			id: "increase-heading",
			name: "Increase Heading",
			editorCallback(editor, view) {
				const lineRange = getLineRange(editor);

				const { headingLines, maxHeading } = getHeadingLines(
					editor,
					lineRange.from,
					lineRange.to
				);

				if (maxHeading !== undefined && maxHeading >= 5) {
					new Notice("Cannot Increase (Includes over Heading 5)");
					return;
				}

				const editorChange = getHeadingShiftChanges(
					editor,
					headingLines,
					increaseHeading
				);

				editor.transaction({
					changes: editorChange,
				});
			},
		});

		this.addCommand({
			id: "decrease-heading",
			name: "Decrease Heading",
			editorCallback: (editor, view) => {
				const lineRange = getLineRange(editor);

				const { headingLines, minHeading } = getHeadingLines(
					editor,
					lineRange.from,
					lineRange.to
				);

				if (
					minHeading !== undefined &&
					minHeading <= Number(this.settings.limitHeadingFrom)
				) {
					new Notice(
						"Cannot Decrease (Includes under Heading 'Lower limit of Heading')"
					);
					return;
				}

				const editorChange = getHeadingShiftChanges(
					editor,
					headingLines,
					decreaseHeading
				);

				editor.transaction({
					changes: editorChange,
				});
			},
		});
		this.addSettingTab(new SettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Lower limit of Heading")
			.setDesc("")
			.addDropdown((n) => {
				const headingOptions: Record<string, string> = {
					noHeading: "0",
					heading1: "1",
					heading2: "2",
					heading3: "3",
					heading4: "4",
					heading5: "5",
				};
				n.addOptions(headingOptions)
					.setValue(String(this.plugin.settings.limitHeadingFrom))
					.onChange(async (value) => {
						this.plugin.settings.limitHeadingFrom = Number(value);
						await this.plugin.saveSettings();
					});
			});

		// new Setting(containerEl)
		// 	.setName("Setting #1")
		// 	.setDesc("It's a secret")
		// 	.addText((text) =>
		// 		text
		// 			.setPlaceholder("Enter your secret")
		// 			.setValue(this.plugin.settings.mySetting)
		// 			.onChange(async (value) => {
		// 				console.log("Secret: " + value);
		// 				this.plugin.settings.mySetting = value;
		// 				await this.plugin.saveSettings();
		// 			})
		// 	);
	}
}
