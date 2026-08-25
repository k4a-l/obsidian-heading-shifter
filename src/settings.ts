import type HeadingShifter from "main";
import {
	LIST_BEHAVIORS_1_10_0,
	settings_1_10_0,
} from "migrations/versions/1.10.0";
import {
	type App,
	PluginSettingTab,
	type SettingDefinitionItem,
} from "obsidian";
import { HEADING_OPTIONS } from "types/type";

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

	override getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: "Lower limit of heading",
				desc: "The lower heading size that will be decreased by the heading shift",
				render: (setting) => {
					setting.addDropdown((dropdown) =>
						dropdown
							.addOptions(HEADING_OPTIONS)
							.setValue(String(this.plugin.settings.limitHeadingFrom))
							.onChange(async (value) => {
								this.plugin.settings.limitHeadingFrom = Number(value);
								await this.plugin.saveSettings();
							}),
					);
				},
			},
			{
				name: "Enable override tab behavior",
				desc: 'Tab execute "increase headings" and shift-tab execute "decrease headings"',
				render: (setting) => {
					setting.addToggle((toggle) =>
						toggle
							.setValue(this.plugin.settings.overrideTab)
							.onChange(async (value) => {
								this.plugin.settings.overrideTab = value;
								await this.plugin.saveSettings();
							}),
					);
				},
			},
			{
				type: "group",
				heading: "Style to remove: Beginning",
				items: [
					{
						name: "Unordered list",
						desc: "-",
						render: (setting) => {
							setting.addToggle((toggle) =>
								toggle
									.setValue(this.plugin.settings.styleToRemove.beginning.ul)
									.onChange(async (value) => {
										this.plugin.settings.styleToRemove.beginning.ul = value;
										await this.plugin.saveSettings();
									}),
							);
						},
					},
					{
						name: "Ordered list",
						desc: "1., 2. ,3. ,...",
						render: (setting) => {
							setting.addToggle((toggle) =>
								toggle
									.setValue(this.plugin.settings.styleToRemove.beginning.ol)
									.onChange(async (value) => {
										this.plugin.settings.styleToRemove.beginning.ol = value;
										await this.plugin.saveSettings();
									}),
							);
						},
					},
					{
						name: "User defined",
						desc: "Arbitrary string (regular expression)",
						render: (setting) => {
							setting.addTextArea((textarea) =>
								textarea
									.setValue(
										this.plugin.settings.styleToRemove.beginning.userDefined.join(
											"\n",
										),
									)
									.onChange(async (str) => {
										this.plugin.settings.styleToRemove.beginning.userDefined =
											str.split("\n");
										await this.plugin.saveSettings();
									}),
							);
						},
					},
				],
			},
			{
				type: "group",
				heading: "Style to remove: Surrounding",
				items: [
					{
						name: "Bold",
						desc: "**|__",
						render: (setting) => {
							setting.addToggle((toggle) =>
								toggle
									.setValue(this.plugin.settings.styleToRemove.surrounding.bold)
									.onChange(async (value) => {
										this.plugin.settings.styleToRemove.surrounding.bold = value;
										await this.plugin.saveSettings();
									}),
							);
						},
					},
					{
						name: "Italic",
						desc: "*|_",
						render: (setting) => {
							setting.addToggle((toggle) =>
								toggle
									.setValue(
										this.plugin.settings.styleToRemove.surrounding.italic,
									)
									.onChange(async (value) => {
										this.plugin.settings.styleToRemove.surrounding.italic =
											value;
										await this.plugin.saveSettings();
									}),
							);
						},
					},
					{
						name: "User defined",
						desc: "Arbitrary string (regular expression)",
						render: (setting) => {
							setting.addTextArea((textarea) =>
								textarea
									.setValue(
										this.plugin.settings.styleToRemove.surrounding.userDefined.join(
											"\n",
										),
									)
									.onChange(async (str) => {
										this.plugin.settings.styleToRemove.surrounding.userDefined =
											str.split("\n");
										await this.plugin.saveSettings();
									}),
							);
						},
					},
				],
			},
			{
				type: "group",
				heading: "List",
				items: [
					{
						name: "Children behavior",
						render: (setting) => {
							setting.addDropdown((dropdown) =>
								dropdown
									.addOption("outdent to zero", "Outdent to 0")
									.addOption("sync with headings", "Sync with headings")
									.addOption("noting", "Noting")
									.setValue(this.plugin.settings.list.childrenBehavior)
									.onChange(async (v) => {
										const behavior = LIST_BEHAVIORS_1_10_0.find((b) => b === v);
										if (behavior) {
											this.plugin.settings.list.childrenBehavior = behavior;
											await this.plugin.saveSettings();
										}
									}),
							);
						},
					},
				],
			},
			{
				type: "group",
				heading: "Editor",
				items: [
					{
						name: "Tab size",
						render: (setting) => {
							setting.addSlider((slider) =>
								slider
									.setLimits(2, 8, 2)
									.setValue(this.plugin.settings.editor.tabSize)
									.onChange(async (v) => {
										this.plugin.settings.editor.tabSize = v;
										await this.plugin.saveSettings();
									}),
							);
						},
					},
				],
			},
		];
	}
}
