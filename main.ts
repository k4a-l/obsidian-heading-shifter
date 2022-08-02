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

import { applyHeading, ApplyHeading, Heading } from "./src/features/applyHeading";

interface MyPluginSettings {
	limitHeadingFrom: number;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	limitHeadingFrom: 1,
};

const checkHeading = (content: string): number => {
	const match = content.match(/^(#+) /);
	if (!match) return 0;
	if (match[1]) return match[1].length;
	return 0;
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		const headings: Heading[] = [0, 1, 2, 3, 4, 5];
		headings.forEach((heading) =>
			this.addCommand(new ApplyHeading(heading).command)
		);

		const setMin = (prev: undefined | number, cur: number): number => {
			if (prev == undefined || (prev !== undefined && cur < prev)) {
				return cur;
			}
			return prev;
		};

		const setMax = (prev: undefined | number, cur: number): number => {
			if (prev == undefined || (prev !== undefined && cur > prev)) {
				return cur;
			}
			return prev;
		};

		this.addCommand({
			id: "increase-heading",
			name: "Increase Heading",
			editorCallback(editor, view) {
				const lineRange = {
					from: editor.getCursor("from").line,
					to: editor.getCursor("to").line,
				};

				let headingLines: { line: number; heading: number }[] = [];
				let minHeading: undefined | number = undefined;
				let maxHeading: undefined | number = undefined;

				for (let line = lineRange.from; line <= lineRange.to; line++) {
					const heading = checkHeading(editor.getLine(line));
					if (heading > 0) {
						headingLines.push({ line, heading });
						minHeading = setMin(minHeading, heading);
						maxHeading = setMax(maxHeading, heading);
					}
				}

				if (maxHeading !== undefined && maxHeading >= 5) {
					new Notice("Cannot Increase (Includes over Heading 5)");
					return;
				}

				const editorChange: EditorChange[] = [];

				for (const headingLine of headingLines) {
					const shifted = applyHeading(
						editor.getLine(headingLine.line),
						headingLine.heading + 1
					);

					editorChange.push({
						text: shifted,
						from: { line: headingLine.line, ch: 0 },
						to: {
							line: headingLine.line,
							ch: editor.getLine(headingLine.line).length,
						},
					});
				}

				const transaction: EditorTransaction = {
					changes: editorChange,
				};

				console.log(minHeading, maxHeading);

				editor.transaction(transaction);
			},
		});

		this.addCommand({
			id: "decrease-heading",
			name: "Decrease Heading",
			editorCallback(editor, view) {},
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
				n.addOptions(headingOptions).onChange(async (value) => {
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
