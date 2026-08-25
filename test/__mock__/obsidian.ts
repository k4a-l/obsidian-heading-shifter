import type {
	EditorChange,
	EditorPosition,
	EditorRangeOrCaret,
	EditorSelection,
	EditorTransaction,
} from "obsidian";
import type { MinimumEditor } from "utils/editorChange";

export class PluginSettingTab {}
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

const normalizeSelection = (sel: EditorRangeOrCaret): EditorSelection => ({
	anchor: sel.from,
	head: sel.to ?? sel.from,
});

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
	setSelection(anchor: EditorPosition, head?: EditorPosition) {
		this.selections = [{ anchor, head: head ?? anchor }];
	}
	setCursor(pos: number | EditorPosition, ch?: number): void {
		if (typeof pos === "number") {
			this.selections = [
				{
					anchor: { line: pos, ch: ch ?? 0 },
					head: { line: pos, ch: ch ?? 0 },
				},
			];
		} else {
			this.selections = [{ anchor: pos, head: pos }];
		}
	}
	getCursor(type?: "from" | "to" | "head" | "anchor"): EditorPosition {
		const sel = this.selections[0] ?? {
			anchor: { line: 0, ch: 0 },
			head: { line: 0, ch: 0 },
		};
		if (type === "head") return sel.head;
		return sel.anchor;
	}
	listSelections(): EditorSelection[] {
		return this.selections;
	}
	transaction(transaction: EditorTransaction): void {
		if (transaction.changes) {
			const sorted = [...transaction.changes].sort((a, b) => {
				if (b.from.line !== a.from.line) return b.from.line - a.from.line;
				return (b.to?.ch ?? b.from.ch) - (a.to?.ch ?? a.from.ch);
			});
			for (const change of sorted) {
				const line = this.lines[change.from.line] ?? "";
				const fromCh = change.from.ch;
				const toCh = change.to?.ch ?? fromCh;
				const before = line.slice(0, fromCh);
				const after = line.slice(toCh);
				this.lines[change.from.line] = before + change.text + after;

				if (!transaction.selections && !transaction.selection) {
					const delta = change.text.length - (toCh - fromCh);
					this.selections = this.selections.map((sel) => {
						const mapPos = (pos: EditorPosition): EditorPosition => {
							if (pos.line !== change.from.line) return pos;
							if (pos.ch < fromCh) return pos;
							if (pos.ch > toCh) {
								return { line: pos.line, ch: pos.ch + delta };
							}
							return { line: pos.line, ch: fromCh + change.text.length };
						};
						return {
							anchor: mapPos(sel.anchor),
							head: mapPos(sel.head),
						};
					});
				}
			}
		}
		if (transaction.selections) {
			this.selections = transaction.selections.map(normalizeSelection);
		} else if (transaction.selection) {
			this.selections = [normalizeSelection(transaction.selection)];
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
		if (b.from.line !== a.from.line) return b.from.line - a.from.line;
		return (b.to?.ch ?? b.from.ch) - (a.to?.ch ?? a.from.ch);
	});

	for (const change of sortedChanges) {
		const line = lines[change.from.line] ?? "";
		const fromCh = change.from.ch;
		const toCh = change.to?.ch ?? fromCh;
		const before = line.slice(0, fromCh);
		const after = line.slice(toCh);
		lines[change.from.line] = before + change.text + after;
	}

	return lines.join("\n");
};
