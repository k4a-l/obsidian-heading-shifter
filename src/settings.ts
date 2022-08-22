import HeadingShifter from "main";
import { PluginSettingTab, App, Setting } from "obsidian";
import { HEADINGS } from "types/type";

export interface HeadingShifterSettings {
	limitHeadingFrom: number;
	overrideTab: boolean;
}

export const DEFAULT_SETTINGS: HeadingShifterSettings = {
	limitHeadingFrom: 1,
	overrideTab: false,
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
	}
}
