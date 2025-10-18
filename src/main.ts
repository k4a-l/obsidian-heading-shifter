import { migrateSettings } from "migrations/migration";
import { MIGRATION_OBJECT } from "migrations/type";
import { Plugin } from "obsidian";
import { InterfaceService } from "services/interfaceService";
import { ObsidianService } from "services/obsidianService";
import { RegisterService } from "services/registerService";
import {
	type HeadingShifterSettings,
	HeadingShifterSettingTab,
} from "settings";

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
		const rawSettings = await this.loadData();
		this.settings = migrateSettings({
			settings: rawSettings,
			latestVersion: this.manifest.version,
			migrationObject: MIGRATION_OBJECT,
		});
		await this.saveSettings();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
