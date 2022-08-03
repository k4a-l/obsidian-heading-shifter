import {
	checkFence,
	checkHeading,
	FenceType,
	getFenceStatus,
	getHeadingLines,
} from "utils/markdown";

describe("checkHeading", () => {
	test("match", () => {
		expect(checkHeading("# content")).toBe(1);
		expect(checkHeading("## content")).toBe(2);
		expect(checkHeading("########## content")).toBe(10);
	});

	test("unmatch", () => {
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

	test("unmatch", () => {
		expect(checkFence("``")).toBeNull();
		expect(checkFence("~~")).toBeNull();
		expect(checkFence(" ```")).toBeNull();
		expect(checkFence(" ~~~")).toBeNull();
	});
});

describe("fenceStatus", () => {
	const fences: ("`" | "~")[] = ["`", `~`];
	for (let fenceType of fences) {
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

class Editor {
	private lines: string[];
	constructor(content: string) {
		this.lines = content.split(`\n`);
	}
	getLine(number: number) {
		return this.lines[number];
	}
}

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

### Heaging3`;

		const editor = new Editor(input);

		expect(getHeadingLines(editor, 0, 20)).toEqual({
			headingLines: [0, 2, 20],
			minHeading: 1,
			maxHeading: 3,
		});
	});
});