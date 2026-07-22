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

	/**
	 * Apply a transaction in-place to this.lines.
	 * Handles EditorChange objects that replace a range from `from.line`..`to.line`
	 * with `text` (which may contain multiple lines). Multiple changes are applied
	 * bottom-up (descending by from.line) so indexes remain valid.
	 */
	transaction(transaction: { changes: EditorChange[] }): void {
		const sortedChanges = [...transaction.changes].sort((a, b) => {
			if (a.from.line === b.from.line) return (b.to.line ?? b.from.line) - (a.to.line ?? a.from.line);
			return b.from.line - a.from.line;
		});

		for (const change of sortedChanges) {
			const from = change.from.line;
			const to = (change as any).to?.line ?? change.from.line;
			const newLines = change.text === undefined || change.text === null ? [""] : change.text.split("\n");
			// splice: remove (to - from + 1) lines and insert newLines
			this.lines.splice(from, to - from + 1, ...newLines);
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
	const sortedChanges = [...changes].sort((a, b) => {
		if (a.from.line === b.from.line) return (b.to?.line ?? b.from.line) - (a.to?.line ?? a.from.line);
		return b.from.line - a.from.line;
	});

	for (const change of sortedChanges) {
		const from = change.from.line;
		const to = (change as any).to?.line ?? change.from.line;
		const newLines = change.text === undefined || change.text === null ? [""] : change.text.split("\n");
		lines.splice(from, to - from + 1, ...newLines);
	}

	return lines.join("\n");
};
