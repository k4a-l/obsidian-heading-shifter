// __mocks__/obsidian.ts

import type { EditorChange, EditorPosition, EditorSelection } from "obsidian";
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

/**
 * Notice
 */
export class Notice {
	message: string | DocumentFragment;
	constructor(message: string | DocumentFragment, _duration?: number) {
		this.message = message;
	}
}

export class MockEditor implements MinimumEditor {
	private lines: string[];
	private selections: EditorSelection[];
	constructor(
		content: string,
		selections: EditorSelection[] = [
			{ anchor: { line: 0, ch: 0 }, head: { line: 0, ch: 0 } },
		],
	) {
		this.lines = content.split(`\n`);
		this.selections = selections;
	}
	getLine(number: number) {
		return this.lines[number] ?? "";
	}
	lineCount() {
		return this.lines.length;
	}
	setSelection() {}
	setCursor(_pos: number | EditorPosition): void {}
	getCursor(): EditorPosition {
		return { ch: 0, line: 0 };
	}
	listSelections(): EditorSelection[] {
		return this.selections;
	}
	transaction(transaction: { changes: EditorChange[] }): void {
		// Apply bottom-up; changes only replace whole lines, so order is safe.
		const sorted = [...transaction.changes].sort(
			(a, b) => b.from.line - a.from.line,
		);
		for (const change of sorted) {
			this.lines[change.from.line] = change.text;
		}
	}
	getValue(): string {
		return this.lines.join("\n");
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
