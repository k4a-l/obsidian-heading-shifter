import type HeadingShifter from "main";
import { type App, PluginSettingTab, Setting } from "obsidian";
import { HEADINGS } from "types/type";

export type HeadingShifterSettings = {
	limitHeadingFrom: number;
	overrideTab: boolean;
	styleToRemove: {
		beginning: { ul: boolean; ol: boolean; userDefined: string[] };
		surrounding: { bold: boolean; italic: boolean; userDefined: string[] };
	};
	autoOutdent: {
		enable: boolean;
		hotKey: {
			key: string;
			shift: boolean;
			ctrl: boolean;
			alt: boolean;
		};
	};
	autoIndentBulletedHeader: boolean;
};

export const DEFAULT_SETTINGS: HeadingShifterSettings = {
	limitHeadingFrom: 1,
	overrideTab: false,
	styleToRemove: {
		beginning: { ul: true, ol: true, userDefined: [] },
		surrounding: { bold: false, italic: false, userDefined: [] },
	},
	autoOutdent: {
		enable: true,
		hotKey: {
			key: "Tab",
			shift: true,
			ctrl: false,
			alt: false,
		},
	},
	autoIndentBulletedHeader: false,
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
				"The lower Heading Size that will be decreased by the Heading Shift ",
			)
			.addDropdown((dropdown) => {
				// Create options from heading array like {'0':'0','1':'1',.......}
				const headingOptions: Record<string, string> = HEADINGS.reduce(
					(prev, heading) => {
						return { ...prev, [heading]: String(heading) };
					},
					{},
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

		containerEl.createEl("h3", { text: "Auto Outdent" });
		containerEl.createEl("p", {
			text: "When heading is applied to a list, if outdent is needed for lists after that line, execute it.",
		});
		new Setting(containerEl).setName("Enable").addToggle((toggle) => {
			toggle.setValue(this.plugin.settings.autoOutdent.enable).onChange((v) => {
				this.plugin.settings.autoOutdent.enable = v;
				this.plugin.saveSettings();
			});
		});

		containerEl.createEl("b", {
			text: "Hotkey",
		});
		containerEl.createEl("p", {
			text: "Basically, we expect you to apply `Shift + Tab` from https://github.com/vslinko/obsidian-outliner, but if you want to use something else, apply a hotkey with equivalent functionality.",
			cls: "setting-item-description",
		});
		new Setting(containerEl).setName("Key").addText((toggle) => {
			toggle
				.setValue(this.plugin.settings.autoOutdent.hotKey.key)
				.onChange((v) => {
					this.plugin.settings.autoOutdent.hotKey.key = v;
					this.plugin.saveSettings();
				});
		});
		new Setting(containerEl).setName("Shift").addToggle((toggle) => {
			toggle
				.setValue(this.plugin.settings.autoOutdent.hotKey.shift)
				.onChange((v) => {
					this.plugin.settings.autoOutdent.hotKey.shift = v;
					this.plugin.saveSettings();
				});
		});
		new Setting(containerEl).setName("Ctrl").addToggle((toggle) => {
			toggle
				.setValue(this.plugin.settings.autoOutdent.hotKey.ctrl)
				.onChange((v) => {
					this.plugin.settings.autoOutdent.hotKey.ctrl = v;
					this.plugin.saveSettings();
				});
		});
		new Setting(containerEl).setName("Alt").addToggle((toggle) => {
			toggle
				.setValue(this.plugin.settings.autoOutdent.hotKey.alt)
				.onChange((v) => {
					this.plugin.settings.autoOutdent.hotKey.alt = v;
					this.plugin.saveSettings();
				});
		});

		containerEl.createEl("h3", { text: "Auto Indent Bulleted Headers" });
		containerEl.createEl("p", {
			text: "When a header is applied to bulleted list, indent the line according to the header level.",
		});
		new Setting(containerEl)
			.setName("Enable auto indented bulleted headers")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.autoIndentBulletedHeader)
					.onChange((v) => {
						this.plugin.settings.autoIndentBulletedHeader = v;
						this.plugin.saveSettings();
					});
			});
	}
}
