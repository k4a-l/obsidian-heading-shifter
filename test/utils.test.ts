import { RegExpExample } from "constant/regExp";
import {
	composeLineChanges,
	computeLineChange,
	mapSelectionPositions,
} from "utils/editorChange";
import {
	checkFence,
	checkHeading,
	type FenceType,
	getFenceStatus,
	getHeadingLines,
	getHeadingSubtreeLines,
	getListChildrenLines,
	getPreviousHeading,
	removeUsingRegexpStrings,
} from "utils/markdown";
import { assignUnknownObjectFromDefaultObject } from "utils/object";
import { createRange } from "utils/range";
import { describe, expect, test } from "vitest";
import { MockEditor } from "./__mock__/obsidian";
import { _t } from "./helper";

describe("computeLineChange", () => {
	test("returns null when there is no change", () => {
		expect(computeLineChange(0, "abc", "abc")).toBeNull();
	});

	test("inserts prefix on an empty line", () => {
		expect(computeLineChange(0, "", "## ")).toEqual({
			text: "## ",
			from: { line: 0, ch: 0 },
			to: { line: 0, ch: 0 },
		});
	});

	test("inserts prefix on a non-empty line (heading added)", () => {
		expect(computeLineChange(1, "abcde", "## abcde")).toEqual({
			text: "## ",
			from: { line: 1, ch: 0 },
			to: { line: 1, ch: 0 },
		});
	});

	test("removes prefix (heading removed)", () => {
		expect(computeLineChange(0, "## abcde", "abcde")).toEqual({
			text: "",
			from: { line: 0, ch: 0 },
			to: { line: 0, ch: 3 },
		});
	});

	test("increments heading level (inserts single #)", () => {
		expect(computeLineChange(0, "## abcde", "### abcde")).toEqual({
			text: "#",
			from: { line: 0, ch: 2 },
			to: { line: 0, ch: 2 },
		});
	});

	test("decrements heading level (deletes single #)", () => {
		expect(computeLineChange(0, "### abcde", "## abcde")).toEqual({
			text: "",
			from: { line: 0, ch: 2 },
			to: { line: 0, ch: 3 },
		});
	});

	test("changes non-consecutive prefix", () => {
		expect(computeLineChange(0, "- abc", "\t- ## abc")).toEqual({
			text: "\t- ##",
			from: { line: 0, ch: 0 },
			to: { line: 0, ch: 1 },
		});
	});
});

describe("mapSelectionPositions", () => {
	test("shifts cursor at column 0 to after inserted prefix", () => {
		const change = {
			text: "## ",
			from: { line: 0, ch: 0 },
			to: { line: 0, ch: 0 },
		};
		const selections = [
			{
				anchor: { line: 0, ch: 0 },
				head: { line: 0, ch: 0 },
			},
		];
		expect(mapSelectionPositions(selections, [change])).toEqual([
			{
				anchor: { line: 0, ch: 3 },
				head: { line: 0, ch: 3 },
			},
		]);
	});

	test("shifts selection range starting at column 0", () => {
		const change = {
			text: "## ",
			from: { line: 0, ch: 0 },
			to: { line: 0, ch: 0 },
		};
		const selections = [
			{
				anchor: { line: 0, ch: 0 },
				head: { line: 0, ch: 3 },
			},
		];
		expect(mapSelectionPositions(selections, [change])).toEqual([
			{
				anchor: { line: 0, ch: 3 },
				head: { line: 0, ch: 6 },
			},
		]);
	});

	test("keeps selections on untouched lines unmodified", () => {
		const change = {
			text: "## ",
			from: { line: 0, ch: 0 },
			to: { line: 0, ch: 0 },
		};
		const selections = [
			{
				anchor: { line: 1, ch: 2 },
				head: { line: 1, ch: 2 },
			},
		];
		expect(mapSelectionPositions(selections, [change])).toEqual([
			{
				anchor: { line: 1, ch: 2 },
				head: { line: 1, ch: 2 },
			},
		]);
	});
});

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
		const input = _t`
# Heading1

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

### Heading3
`;

		const editor = new MockEditor(input);

		expect(getHeadingLines(editor, 0, 20)).toEqual({
			headingLines: [0, 2, 20],
			minHeading: 1,
			maxHeading: 3,
		});
	});
});

describe("getHeadingSubtreeLines", () => {
	const input = _t`
# H1
Body 1
## H2-A
Body 2-A
### H3-A1
Body 3-A1
### H3-A2
Body 3-A2
## H2-B
Body 2-B
### H3-B1
# Next H1
`;

	test("collects entire subtree under a single heading", () => {
		const editor = new MockEditor(input);
		// Selecting line 2 (## H2-A)
		expect(getHeadingSubtreeLines(editor, 2, 2)).toEqual({
			headingLines: [2, 4, 6],
			minHeading: 2,
			maxHeading: 3,
		});
	});

	test("collects all subheadings under root H1 until next H1", () => {
		const editor = new MockEditor(input);
		// Selecting line 0 (# H1)
		expect(getHeadingSubtreeLines(editor, 0, 0)).toEqual({
			headingLines: [0, 2, 4, 6, 8, 10],
			minHeading: 1,
			maxHeading: 3,
		});
	});

	test("leaf heading without children only collects itself", () => {
		const editor = new MockEditor(input);
		// Selecting line 4 (### H3-A1)
		expect(getHeadingSubtreeLines(editor, 4, 4)).toEqual({
			headingLines: [4],
			minHeading: 3,
			maxHeading: 3,
		});
	});

	test("range selection over multiple headings merges their subtrees without duplicates", () => {
		const editor = new MockEditor(input);
		// Selecting from line 2 (## H2-A) to line 8 (## H2-B)
		expect(getHeadingSubtreeLines(editor, 2, 8)).toEqual({
			headingLines: [2, 4, 6, 8, 10],
			minHeading: 2,
			maxHeading: 3,
		});
	});

	test("returns empty when no headings are in selection", () => {
		const editor = new MockEditor(input);
		// Selecting line 1 (Body 1)
		expect(getHeadingSubtreeLines(editor, 1, 1)).toEqual({
			headingLines: [],
			minHeading: undefined,
			maxHeading: undefined,
		});
	});

	test("ignores headings inside code fences in subtree", () => {
		const fencedInput = _t`
## Target H2
Body text
\`\`\`markdown
### Fenced heading (not real)
\`\`\`
### Real Child H3
`;
		const editor = new MockEditor(fencedInput);
		expect(getHeadingSubtreeLines(editor, 0, 0)).toEqual({
			headingLines: [0, 5],
			minHeading: 2,
			maxHeading: 3,
		});
	});
});

describe("getPreviousHeading", () => {
	test("normal", () => {
		const input = _t`
# Heading1

## Heading2

Normal

`;

		const editor = new MockEditor(input);
		expect(getPreviousHeading(editor, 4)).toEqual(2);
	});

	test("edge", () => {
		const input = _t`
# Heading1

## Heading2

Normal
`;
		const editor = new MockEditor(input);
		expect(getPreviousHeading(editor, 1)).toEqual(0);
	});

	test("no heading", () => {
		const input = _t`
Normal

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
		const input = _t`
# Heading1

## Heading2

Normal
`;
		const editor = new MockEditor(input);
		expect(getPreviousHeading(editor, 2)).toEqual(0);
	});

	test("first line = undefined", () => {
		const input = `# Heading1`;
		const editor = new MockEditor(input);
		expect(getPreviousHeading(editor, 0)).toBeUndefined();
	});
});

describe("compose editorChange", () => {
	test("", () => {
		const input = _t`
a
b
c
d
e
f
`;
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
		obj: { strInObj: "string", numInObj: 1 },
		boolean: false,
		arr: [1, 2, 3],
	};
	test("all properties are null", () => {
		const UnknownObj = {};
		const result = assignUnknownObjectFromDefaultObject(defaultObj, UnknownObj);
		expect(result).toStrictEqual(defaultObj);
	});

	test("some properties are null", () => {
		const UnknownObj = {
			str: "other string",
			obj: { numInObj: 2 },
			boolean: true,
		};
		const result = assignUnknownObjectFromDefaultObject(defaultObj, UnknownObj);
		expect(result).toStrictEqual({
			str: UnknownObj.str,
			num: defaultObj.num,
			obj: {
				strInObj: defaultObj.obj.strInObj,
				numInObj: UnknownObj.obj.numInObj,
			},
			boolean: UnknownObj.boolean,
			arr: defaultObj.arr,
		});
	});
});

describe("getListChildrenLines", () => {
	test("0", () => {
		const str = _t`
 first line(not target)
    - a
        * b
    - c
- d
`;
		expect(
			getListChildrenLines(new MockEditor(str), {
				parentLineNumber: 0,
			}),
		).toStrictEqual([1, 2, 3]);
	});

	test("1", () => {
		const str = _t`
 first line(not target)
- a
        - b
    - c
- d
`;
		expect(
			getListChildrenLines(new MockEditor(str), {
				parentLineNumber: 0,
			}),
		).toStrictEqual([]);
	});

	test("2", () => {
		const str = _t`
 first line(not target)
        - a
        - b
    - c
    - d
`;
		expect(
			getListChildrenLines(new MockEditor(str), {
				parentLineNumber: 0,
			}),
		).toStrictEqual([1, 2, 3, 4]);
	});

	test("3", () => {
		const str = _t`
 first line(not target)
	- a
		- b
	1. 
-d
`;
		expect(
			getListChildrenLines(new MockEditor(str), {
				parentLineNumber: 0,
			}),
		).toStrictEqual([1, 2, 3]);
	});
});
