// __mocks__/obsidian.ts

import type { EditorChange, EditorPosition } from "obsidian";
import type { MinimumEditor } from "utils/editorChange";

/**
 * Setting
 */
export class Setting {
	// constructor(containerEl: HTMLElement) {}
	setName(_name: string) {
		return this;
	}
	setDesc(_desc: string) {
		return this;
	}
	addText(_cb: (component: unknown) => unknown) {
		return this;
	}
	addToggle(_cb: (component: unknown) => unknown) {
		return this;
	}
	addDropdown(_cb: (component: unknown) => unknown) {
		return this;
	}
	addTextArea(_cb: (component: unknown) => unknown) {
		return this;
	}
}

/**
 * PluginSettingTab
 */
export class PluginSettingTab {
	// constructor(_app: App, _plugin: unknown) {}
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

export const applyEditorChanges = (
	content: string,
	changes: EditorChange[],
): string => {
	const lines = content.split("\n");
	const sortedChanges = [...changes].sort((a, b) => b.from.line - a.from.line);

	for (const change of sortedChanges) {
		lines[change.from.line] = change.text;
	}

	return lines.join("\n");
};
