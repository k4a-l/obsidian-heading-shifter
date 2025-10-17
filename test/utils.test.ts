import { RegExpExample } from "constant/regExp";
import { composeLineChanges } from "utils/editorChange";
import {
	checkFence,
	checkHeading,
	type FenceType,
	getFenceStatus,
	getHeadingLines,
	getListChildrenLines,
	getPreviousHeading,
	removeUsingRegexpStrings,
} from "utils/markdown";
import { assignUnknownObjectFromDefaultObject } from "utils/object";
import { createRange } from "utils/range";
import { describe, expect, test } from "vitest";
import { MockEditor } from "./__mock__/obsidian";

describe("checkHeading", () => {
	test("match", () => {
		expect(checkHeading("# content")).toBe(1);
		expect(checkHeading("## content")).toBe(2);
		expect(checkHeading("########## content")).toBe(10);
	});

	test("unMatch", () => {
		expect(checkHeading("content")).toBe(0);
		expect(checkHeading("#content")).toBe(0);
		expect(checkHeading(" # content")).toBe(0);
	});
});

describe("checkFence", () => {
	test("match backtick 3", () => {
		const result: FenceType = { fenceType: "`", fenceNum: 3 };
		expect(checkFence("```")).toEqual(result);
	});

	test("match backtick 10", () => {
		const result: FenceType = { fenceType: "`", fenceNum: 10 };
		expect(checkFence("``````````")).toEqual(result);
	});

	test("match tilde 3", () => {
		const result: FenceType = { fenceType: "~", fenceNum: 3 };
		expect(checkFence("~~~")).toEqual(result);
	});

	test("match tilde 10", () => {
		const result: FenceType = { fenceType: "~", fenceNum: 10 };
		expect(checkFence("~~~~~~~~~~")).toEqual(result);
	});

	test("unMatch", () => {
		expect(checkFence("``")).toBeNull();
		expect(checkFence("~~")).toBeNull();
		expect(checkFence(" ```")).toBeNull();
		expect(checkFence(" ~~~")).toBeNull();
	});
});

describe("fenceStatus", () => {
	const fences: ("`" | "~")[] = ["`", `~`];
	for (const fenceType of fences) {
		test(`start fence(${fenceType})`, () => {
			const result: FenceType = { fenceType, fenceNum: 3 };
			expect(getFenceStatus(null, result)).toEqual(result);
		});

		test(`finish fence(${fenceType})`, () => {
			const prev: FenceType = { fenceType, fenceNum: 3 };
			expect(getFenceStatus(prev, prev)).toEqual(null);
		});

		test(`finish fence greater than start(${fenceType})`, () => {
			const prev: FenceType = { fenceType, fenceNum: 3 };
			const current: FenceType = { fenceType, fenceNum: 4 };
			expect(getFenceStatus(prev, current)).toEqual(null);
		});

		test(`not finish fence less than start(${fenceType})`, () => {
			const prev: FenceType = { fenceType, fenceNum: 4 };
			const current: FenceType = { fenceType, fenceNum: 3 };
			expect(getFenceStatus(prev, current)).toEqual(prev);
		});
	}
});

describe("getHeadingLines", () => {
	test("normal", () => {
		const input = `# Heading1

## Heading2

~~~~

addAbortSignal

~~~

## Heading2
Normal

### Heading3
Normal

~~~

~~~~

### Heading3`;

		const editor = new MockEditor(input);

		expect(getHeadingLines(editor, 0, 20)).toEqual({
			headingLines: [0, 2, 20],
			minHeading: 1,
			maxHeading: 3,
		});
	});
});

describe("getPreviousHeading", () => {
	test("normal", () => {
		const input = `# Heading1

## Heading2

Normal

`;

		const editor = new MockEditor(input);
		expect(getPreviousHeading(editor, 4)).toEqual(2);
	});

	test("edge", () => {
		const input = `# Heading1

## Heading2

Normal
`;
		const editor = new MockEditor(input);
		expect(getPreviousHeading(editor, 1)).toEqual(0);
	});

	test("no heading", () => {
		const input = `Normal

Normal

~~~~

addAbortSignal

~~~

Normal

`;

		const editor = new MockEditor(input);
		expect(getPreviousHeading(editor, 10)).toEqual(undefined);
	});

	test("'from line' contains heading", () => {
		const input = `# Heading1

## Heading2

Normal
	`;
		const editor = new MockEditor(input);
		expect(getPreviousHeading(editor, 2)).toEqual(0);
	});
});

describe("compose editorChange", () => {
	test("", () => {
		const input = `a
b
c
d
e
f`;
		const editor = new MockEditor(input);
		const changeCallback = (chunk: string) =>
			`==begin==${chunk.toUpperCase()}==end==`;
		expect(composeLineChanges(editor, [0, 2, 4], changeCallback)).toEqual([
			{
				text: "==begin==A==end==",
				from: { line: 0, ch: 0 },
				to: { line: 0, ch: 1 },
			},
			{
				text: "==begin==C==end==",
				from: { line: 2, ch: 0 },
				to: { line: 2, ch: 1 },
			},
			{
				text: "==begin==E==end==",
				from: { line: 4, ch: 0 },
				to: { line: 4, ch: 1 },
			},
		]);
	});
});

describe("range", () => {
	test("createRange", () => {
		expect(createRange(0, 3)).toStrictEqual([0, 1, 2]);
	});
});

describe("regExp Example", () => {
	const content = "EXAMPLE";

	test("bold(**)", () => {
		expect(
			removeUsingRegexpStrings(`**${content}**`, {
				surrounding: [RegExpExample.surrounding.bold],
			}),
		).toBe(content);
	});
	test("bold(__)", () => {
		expect(
			removeUsingRegexpStrings(`__${content}__`, {
				surrounding: [RegExpExample.surrounding.bold],
			}),
		).toBe(content);
	});

	test("italic(*)", () => {
		expect(
			removeUsingRegexpStrings(`*${content}*`, {
				surrounding: [RegExpExample.surrounding.italic],
			}),
		).toBe(content);
	});
	test("italic(__)", () => {
		expect(
			removeUsingRegexpStrings(`_${content}_`, {
				surrounding: [RegExpExample.surrounding.italic],
			}),
		).toBe(content);
	});

	test("ol(1)", () => {
		expect(
			removeUsingRegexpStrings(`1. ${content}`, {
				beginning: [RegExpExample.beginning.ol],
			}),
		).toBe(content);
	});
	test("ol(1234567890)", () => {
		expect(
			removeUsingRegexpStrings(`1234567890. ${content}`, {
				beginning: [RegExpExample.beginning.ol],
			}),
		).toBe(content);
	});

	test("ul(-)", () => {
		expect(
			removeUsingRegexpStrings(`- ${content}`, {
				beginning: [RegExpExample.beginning.ul],
			}),
		).toBe(content);
	});
	test("ul(*)", () => {
		expect(
			removeUsingRegexpStrings(`* ${content}`, {
				beginning: [RegExpExample.beginning.ul],
			}),
		).toBe(content);
	});
});

describe("assignUnknownObjectFromDefaultObject", () => {
	const defaultObj = {
		str: "string",
		num: 1,
		obj: { str: "string", num: 1 },
		arr: [1, 2, 3],
	};
	test("all properties are null", () => {
		const UnknownObj = {};
		assignUnknownObjectFromDefaultObject(defaultObj, UnknownObj);
		expect(UnknownObj).toStrictEqual(defaultObj);
	});

	test("some properties are null", () => {
		const UnknownObj = { str: "other string", obj: { num: 2 } };
		assignUnknownObjectFromDefaultObject(defaultObj, UnknownObj);
		expect(UnknownObj).toStrictEqual({
			str: UnknownObj.str,
			num: defaultObj.num,
			obj: { str: defaultObj.obj.str, num: UnknownObj.obj.num },
			arr: defaultObj.arr,
		});
	});
});

describe("getListChildrenLines", () => {
	test("0", () => {
		const str = String.raw` first line(not target)
    - a
        * b
    - c
- d `;
		expect(
			getListChildrenLines(new MockEditor(str), {
				parentLineNumber: 0,
			}),
		).toStrictEqual([1, 2, 3]);
	});

	test("1", () => {
		const str = String.raw` first line(not target)
- a
        - b
    - c
- d `;
		expect(
			getListChildrenLines(new MockEditor(str), {
				parentLineNumber: 0,
			}),
		).toStrictEqual([]);
	});

	test("2", () => {
		const str = String.raw` first line(not target)
        - a
        - b
    - c
    - d `;
		expect(
			getListChildrenLines(new MockEditor(str), {
				parentLineNumber: 0,
			}),
		).toStrictEqual([1, 2, 3, 4]);
	});

	test("3", () => {
		const str = String.raw` first line(not target)
	- a
		- b
	1. 
-d `;
		expect(
			getListChildrenLines(new MockEditor(str), {
				parentLineNumber: 0,
			}),
		).toStrictEqual([1, 2, 3]);
	});
});
