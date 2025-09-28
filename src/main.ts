import { Plugin } from "obsidian";
import { InterfaceService } from "services/interfaceService";
import { ObsidianService } from "services/obsidianService";
import { RegisterService } from "services/registerService";
import {
	DEFAULT_SETTINGS,
	type HeadingShifterSettings,
	HeadingShifterSettingTab,
} from "settings";
import { assignUnknownObjectFromDefaultObject } from "utils/object";

export default class HeadingShifter extends Plugin {
	settings: HeadingShifterSettings;
	obsidianService: ObsidianService;
	interfaceService: InterfaceService;
	registerService: RegisterService;

	async onload() {
		this.obsidianService = new ObsidianService();
		this.interfaceService = new InterfaceService();
		this.registerService = new RegisterService(this);

		// Loading
		await this.loadSettings();

		// Command
		this.registerService.exec();
		this.interfaceService.exec();

		// Setting
		// There is a possibility of undefined access when the structure of setting is changed (should be done more carefully, but it is handled by corrective default override).
		assignUnknownObjectFromDefaultObject(DEFAULT_SETTINGS, this.settings);
		this.addSettingTab(new HeadingShifterSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
