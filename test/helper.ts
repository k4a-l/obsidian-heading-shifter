import type { EditorPosition, EditorSelection } from "obsidian";
import { MockEditor } from "./__mock__/obsidian";

/** Tagged template for multi-line fixtures.
 * Removes exactly one leading and one trailing newline (the line breaks that sit against the opening and closing backticks) and nothing else
 * — no indentation is stripped, so `\t`/space indentation and even whitespace-only trailing lines are preserved verbatim.
 * Convention: put the content and BOTH backticks at column 0, and write  meaningful indentation as `\t` escapes.*/
export const _t = (
	strings: TemplateStringsArray,
	...values: unknown[]
): string =>
	strings
		.reduce(
			(acc, s, i) => acc + s + (i < values.length ? String(values[i]) : ""),
			"",
		)
		.replace(/^\r?\n/, "")
		.replace(/\r?\n$/, "");

/** A collapsed cursor on a single line. */
export const cursor = (line: number, ch = 0): EditorSelection => ({
	anchor: { line, ch },
	head: { line, ch },
});

/** A selection spanning start..end. Supports line numbers or explicit EditorPosition. */
export const range = (
	start: number | EditorPosition,
	end: number | EditorPosition,
): EditorSelection => {
	const anchor = typeof start === "number" ? { line: start, ch: 0 } : start;
	const head = typeof end === "number" ? { line: end, ch: 0 } : end;
	return { anchor, head };
};

/** Drive a real command through its editorCallback against a mock document,
 * then return the updated document content and selections. */
export const runCommand = (
	command: { editorCallback: (editor: MockEditor) => unknown },
	input: string,
	selections: EditorSelection[],
): { value: string; selections: EditorSelection[] } => {
	const editor = new MockEditor(input, selections);
	command.editorCallback(editor);
	return {
		value: editor.getValue(),
		selections: editor.listSelections(),
	};
};
