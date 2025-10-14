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

export class MockEditor implements MinimumEditor {
	private lines: string[];
	constructor(content: string) {
		this.lines = content.split(`\n`);
	}
	getLine(number: number) {
		return this.lines[number] ?? "";
	}
	lineCount() {
		return this.lines.length;
	}
	setSelection() {}
	getCursor(): EditorPosition {
		return { ch: 0, line: 0 };
	}
}

