// __mocks__/obsidian.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Setting
 */
export class Setting {
	constructor(containerEl: HTMLElement) {}
	setName(name: string) {
		return this;
	}
	setDesc(desc: string) {
		return this;
	}
	addText(cb: (component: any) => any) {
		return this;
	}
	addToggle(cb: (component: any) => any) {
		return this;
	}
	addDropdown(cb: (component: any) => any) {
		return this;
	}
	addTextArea(cb: (component: any) => any) {
		return this;
	}
}

/**
 * PluginSettingTab
 */
export class PluginSettingTab {
	constructor(app: App, plugin: any) {}
	display() {}
}

/**
 * App, Plugin などの型定義のモック
 */
export type App = {};
export class Plugin {}
