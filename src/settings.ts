import HeadingShifter from "main";
import { PluginSettingTab, App, Setting } from "obsidian";
import { HEADINGS } from "types/type";

export type HeadingShifterSettings = {
	limitHeadingFrom: number;
	overrideTab: boolean;
	styleToRemove: {
		beginning: { ul: boolean; ol: boolean; others: string[] };
		surround: { bold: boolean; italic: boolean; others: string[] };
	};
};

export const DEFAULT_SETTINGS: HeadingShifterSettings = {
	limitHeadingFrom: 1,
	overrideTab: false,
	styleToRemove: {
		beginning: { ul: true, ol: true, others: [] },
		surround: { bold: false, italic: false, others: [] },
	},
};

export class HeadingShifterSettingTab extends PluginSettingTab {
	plugin: HeadingShifter;

	constructor(app: App, plugin: HeadingShifter) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Lower limit of Heading")
			.setDesc(
				"The lower Heading Size that will be decreased by the Heading Shift "
			)
			.addDropdown((dropdown) => {
				// Create options from heading array like {'0':'0','1':'1',.......}
				const headingOptions: Record<string, string> = HEADINGS.reduce(
					(prev, heading) => {
						return { ...prev, [heading]: String(heading) };
					},
					{}
				);

				dropdown
					.addOptions(headingOptions)
					.setValue(String(this.plugin.settings.limitHeadingFrom))
					.onChange(async (value) => {
						this.plugin.settings.limitHeadingFrom = Number(value);
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Enable override tab behavior")
			.setDesc(
				'Tab execute "Increase Headings" and Shift-Tab execute "Decrease Headings"'
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.overrideTab)
					.onChange(async (value) => {
						this.plugin.settings.overrideTab = value;
						await this.plugin.saveSettings();
					})
			);

		containerEl.createEl("h3", { text: "Style to remove" });
		containerEl.createEl("p", {
			text: "If this style is at the <position> of a line, remove it",
		});

		containerEl.createEl("b", { text: "Beggining" });
		new Setting(containerEl)
			.setName("Unordered list")
			.setDesc("-")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.styleToRemove?.beginning?.ul)
					.onChange(async (value) => {
						this.plugin.settings.styleToRemove.beginning.ul = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Ordered list")
			.setDesc("1., 2. ,3. ,...")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.styleToRemove?.beginning?.ol)
					.onChange(async (value) => {
						this.plugin.settings.styleToRemove.beginning.ol = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Others")
			.setDesc("Arbitrary string (regular expression)")
			.addTextArea((str) => {
				str.setValue(
					this.plugin.settings.styleToRemove.beginning?.others?.join(
						"\n"
					)
				).onChange(async (str) => {
					this.plugin.settings.styleToRemove.beginning.others =
						str.split("\n");
					await this.plugin.saveSettings();
				});
			});

		containerEl.createEl("b", {
			text: "Surround",
		});
		new Setting(containerEl)
			.setName("Bold")
			.setDesc("**|__")
			.addToggle((toggle) =>
				toggle
					.setValue(
						this.plugin.settings.styleToRemove?.surround?.bold
					)
					.onChange(async (value) => {
						this.plugin.settings.styleToRemove.surround.bold =
							value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Italic")
			.setDesc("*|_")
			.addToggle((toggle) =>
				toggle
					.setValue(
						this.plugin.settings.styleToRemove?.surround?.italic
					)
					.onChange(async (value) => {
						this.plugin.settings.styleToRemove.surround.italic =
							value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Others")
			.setDesc("Arbitrary string (regular expression)")
			.addTextArea((str) => {
				str.setValue(
					this.plugin.settings.styleToRemove?.surround?.others?.join(
						"\n"
					)
				).onChange(async (str) => {
					this.plugin.settings.styleToRemove.surround.others =
						str.split("\n");
					await this.plugin.saveSettings();
				});
			});
	}
}
