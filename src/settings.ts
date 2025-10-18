import type HeadingShifter from "main";
import { settings_1_10_0 } from "migrations/versions/1.10.0";
import { type App, PluginSettingTab, Setting } from "obsidian";
import { HEADINGS } from "types/type";

export type HeadingShifterSettings = typeof settings_1_10_0.defaultSettings;
export type LIST_BEHAVIOR = HeadingShifterSettings["list"]["childrenBehavior"];

export const DEFAULT_SETTINGS: HeadingShifterSettings =
	settings_1_10_0.defaultSettings;

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
				"The lower Heading Size that will be decreased by the Heading Shift ",
			)
			.addDropdown((dropdown) => {
				// Create options from heading array like {'0':'0','1':'1',.......}
				const headingOptions: Record<string, string> = HEADINGS.reduce(
					(prev, heading) => {
						prev[heading] = String(heading);
						return prev;
					},
					{} as Record<string, string>,
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
				'Tab execute "Increase Headings" and Shift-Tab execute "Decrease Headings"',
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.overrideTab)
					.onChange(async (value) => {
						this.plugin.settings.overrideTab = value;
						await this.plugin.saveSettings();
					}),
			);

		containerEl.createEl("h3", { text: "Style to remove" });
		containerEl.createEl("p", {
			text: "If this style is at the <position> of a line, remove it",
		});

		containerEl.createEl("b", { text: "Beginning" });
		new Setting(containerEl)
			.setName("Unordered list")
			.setDesc("-")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.styleToRemove?.beginning?.ul)
					.onChange(async (value) => {
						this.plugin.settings.styleToRemove.beginning.ul = value;
						await this.plugin.saveSettings();
					}),
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
					}),
			);
		new Setting(containerEl)
			.setName("User defined")
			.setDesc("Arbitrary string (regular expression)")
			.addTextArea((str) => {
				str
					.setValue(
						this.plugin.settings.styleToRemove.beginning?.userDefined?.join(
							"\n",
						),
					)
					.onChange(async (str) => {
						this.plugin.settings.styleToRemove.beginning.userDefined =
							str.split("\n");
						await this.plugin.saveSettings();
					});
			});

		containerEl.createEl("b", {
			text: "Surrounding",
		});
		new Setting(containerEl)
			.setName("Bold")
			.setDesc("**|__")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.styleToRemove?.surrounding?.bold)
					.onChange(async (value) => {
						this.plugin.settings.styleToRemove.surrounding.bold = value;
						await this.plugin.saveSettings();
					}),
			);
		new Setting(containerEl)
			.setName("Italic")
			.setDesc("*|_")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.styleToRemove?.surrounding?.italic)
					.onChange(async (value) => {
						this.plugin.settings.styleToRemove.surrounding.italic = value;
						await this.plugin.saveSettings();
					}),
			);
		new Setting(containerEl)
			.setName("User defined")
			.setDesc("Arbitrary string (regular expression)")
			.addTextArea((str) => {
				str
					.setValue(
						this.plugin.settings.styleToRemove?.surrounding?.userDefined?.join(
							"\n",
						),
					)
					.onChange(async (str) => {
						this.plugin.settings.styleToRemove.surrounding.userDefined =
							str.split("\n");
						await this.plugin.saveSettings();
					});
			});

		containerEl.createEl("h3", { text: "List" });
		new Setting(containerEl)
			.setName("Children behavior")
			.addDropdown((dropdown) => {
				dropdown
					.addOption("outdent to zero" satisfies LIST_BEHAVIOR, "Outdent to 0")
					.addOption(
						"sync with headings" satisfies LIST_BEHAVIOR,
						"Sync with headings",
					)
					.addOption("noting" satisfies LIST_BEHAVIOR, "Noting")
					.setValue(this.plugin.settings.list.childrenBehavior)
					.onChange((v: LIST_BEHAVIOR) => {
						this.plugin.settings.list.childrenBehavior = v;
						this.plugin.saveSettings();
					});
			});

		containerEl.createEl("h3", {
			text: "Editor",
		});
		new Setting(containerEl).setName("Tab size").addSlider((cb) => {
			cb.setDynamicTooltip()
				.setLimits(2, 8, 2)
				.setValue(this.plugin.settings.editor.tabSize)
				.onChange((v) => {
					this.plugin.settings.editor.tabSize = v;
					this.plugin.saveSettings();
				});
		});
	}
}
