import { createListIndentChangesByListBehavior } from "features/applyHeading/module";
import { describe, expect, test } from "vitest";
import { applyEditorChanges, MockEditor } from "./__mock__/obsidian";

const pick = (input: string, lineNumber: number) =>
	input.split("\n")[lineNumber];

describe("Sync with headings", () => {
	// ------------------ PREPARE ------------------ //
	const commonTestFunc = (
		{ input, expected }: { input: string; expected: string },
		{
			parentIndentLevel,
			tabSize,
		}: {
			parentIndentLevel: number;
			tabSize?: number;
		},
	) => {
		const editor = new MockEditor(input);
		const changes = createListIndentChangesByListBehavior(editor, {
			parentLineNumber: 0,
			parentIndentLevel: parentIndentLevel,
			listBehavior: "sync with headings",
			tabSize,
		});
		expect(applyEditorChanges(input, changes)).toStrictEqual(expected);
	};
	// ------------------------------------ //

	test("0->0", () => {
		const input = `- list0
\t- list1
\t\t- list2
\t1. list3
- list4`;

		const expected = input;

		commonTestFunc({ input, expected }, { parentIndentLevel: 0 });
	});

	test("0->2", () => {
		const input = `- list0
\t- list1
\t\t- list2
\t1. list3
- list4`;

		// `pick(input, n)` indicates that the line remains unchanged.
		const expected = `${pick(input, 0)}
\t\t\t- list1
\t\t\t\t- list2
\t\t\t1. list3
${pick(input, 4)}`;

		commonTestFunc({ input, expected }, { parentIndentLevel: 2 });
	});

	test("2->2", () => {
		const input = `\t\t- list0
\t\t\t- list1
\t\t\t\t- list2
\t\t\t1. list3
\t- list4`;

		const expected = input;

		commonTestFunc({ input, expected }, { parentIndentLevel: 2 });
	});

	test("2->0", () => {
		const input = `\t\t- list0
\t\t\t\t- list1
\t\t\t- list2
\t\t1. list3
\t- list4`;

		const expected = `${pick(input, 0)}
\t\t- list1
\t- list2
${pick(input, 3)}
${pick(input, 4)}`;

		commonTestFunc({ input, expected }, { parentIndentLevel: 0 });
	});

	test("3->1: space(2)", () => {
		const tab = `  `;
		const input = `${tab}${tab}${tab}- list0
${tab}${tab}${tab}${tab}${tab}- list1
${tab}${tab}${tab}${tab}1. list2
${tab}${tab}${tab}- list3
- list4`;

		const expected = `${pick(input, 0)}
\t\t\t- list1
\t\t1. list2
${pick(input, 3)}
${pick(input, 4)}`;

		commonTestFunc({ input, expected }, { parentIndentLevel: 1, tabSize: 2 });
	});

	test("no bullets in children", () => {
		const input = `\t- list0
\t\tlist1`;

		const expected = input;

		commonTestFunc({ input, expected }, { parentIndentLevel: 0 });
	});

	test("no bullets in parent", () => {
		const input = `\tlist0
\t\t-list1`;

		const expected = input;

		commonTestFunc({ input, expected }, { parentIndentLevel: 0 });
	});
});

test("outdent to zero", () => {
	const input = `\t- list0
\t\t- list1
\t\t\t- list2
\t\t1. list3
\t- list4`;

	const expected = `${pick(input, 0)}
- list1
\t- list2
1. list3
${pick(input, 4)}`;

	const editor = new MockEditor(input);
	const changes = createListIndentChangesByListBehavior(editor, {
		parentLineNumber: 0,
		parentIndentLevel: 0,
		listBehavior: "outdent to zero",
	});
	expect(applyEditorChanges(input, changes)).toStrictEqual(expected);
});
