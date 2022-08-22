import { Plugin } from "obsidian";

import {
	DEFAULT_SETTINGS,
	HeadingShifterSettings,
	HeadingShifterSettingTab,
} from "settings";
import { ObsidianService } from "services/obsidianService";
import { InterfaceService } from "services/interfaceService";
import { RegisterService } from "services/registerService";

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
		this.addSettingTab(new HeadingShifterSettingTab(this.app, this));
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
