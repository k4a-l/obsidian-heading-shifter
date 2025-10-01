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
	addText(cb: (component: unknown) => unknown) {
		return this;
	}
	addToggle(cb: (component: unknown) => unknown) {
		return this;
	}
	addDropdown(cb: (component: unknown) => unknown) {
		return this;
	}
	addTextArea(cb: (component: unknown) => unknown) {
		return this;
	}
}

/**
 * PluginSettingTab
 */
export class PluginSettingTab {
	constructor(app: App, plugin: unknown) {}
	display() {}
}

/**
 * App, Plugin などの型定義のモック
 */
export type App = unknown;
export class Plugin {}
