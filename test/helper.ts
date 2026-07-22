import type { LineSelection } from "utils/range";
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
export const cursor = (line: number): LineSelection => ({
	anchor: { line },
	head: { line },
});

/** A selection spanning start..end (inclusive). */
export const range = (start: number, end: number): LineSelection => ({
	anchor: { line: start },
	head: { line: end },
});

/** Drive a real command through its editorCallback against a mock document,
 * then read the document back. Tests the command end-to-end (no logic rebuilt
 * in the test). */
export const runCommand = (
	command: { editorCallback: (editor: MockEditor) => unknown },
	input: string,
	selections: LineSelection[],
): string => {
	const editor = new MockEditor(
		input,
		selections.map((s) => {
			return {
				anchor: { line: s.anchor.line, ch: 0 },
				head: { line: s.head.line, ch: 0 },
			};
		}),
	);
	command.editorCallback(editor);
	return editor.getValue();
};
