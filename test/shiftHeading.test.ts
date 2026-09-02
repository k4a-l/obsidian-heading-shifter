import {
	DecreaseHeading,
	IncreaseHeading,
	type ShiftHeadingOptions,
} from "features/shiftHeading/operation";
import { DEFAULT_SETTINGS } from "settings";
import { describe, expect, test } from "vitest";
import { _t, cursor, range, runCommand } from "./helper";

// DEFAULT_SETTINGS.limitHeadingFrom === 1, so decreasing a level-1 heading is
// blocked by default.
const increase = (options: ShiftHeadingOptions = {}) =>
	new IncreaseHeading(DEFAULT_SETTINGS, options);
const decrease = (options: ShiftHeadingOptions = {}) =>
	new DecreaseHeading(DEFAULT_SETTINGS, options);

describe("increase heading command", () => {
	test("increases a single heading", () => {
		expect(runCommand(increase(), "# a", [cursor(0, 2)])).toEqual({
			value: "## a",
			selections: [cursor(0, 3)],
		});
	});

	test("increases every heading in a range", () => {
		const input = _t`
# a
## b
`;
		expect(
			runCommand(increase(), input, [
				range({ line: 0, ch: 2 }, { line: 1, ch: 3 }),
			]),
		).toEqual({
			value: _t`
## a
### b
`,
			selections: [range({ line: 0, ch: 3 }, { line: 1, ch: 4 })],
		});
	});

	test("leaves non-heading lines alone (non-forced)", () => {
		const input = _t`
# a
b
`;
		expect(runCommand(increase(), input, [range(0, 1)])).toEqual({
			value: _t`
## a
b
`,
			selections: [range(0, 1)],
		});
	});

	test("forced also turns a plain line into a heading", () => {
		expect(
			runCommand(increase({ includesNoHeadingsLine: true }), "a", [
				cursor(0, 1),
			]),
		).toEqual({
			value: "# a",
			selections: [cursor(0, 3)],
		});
	});

	test("aborts entirely when a block already contains heading 6", () => {
		const input = _t`
# a
###### b
`;
		expect(runCommand(increase(), input, [range(0, 1)])).toEqual({
			value: input,
			selections: [range(0, 1)],
		});
	});

	test("scattered headings each increase; between lines untouched", () => {
		const input = _t`
# a
b
## c
`;
		expect(runCommand(increase(), input, [cursor(0, 2), cursor(2, 3)])).toEqual(
			{
				value: _t`
## a
b
### c
`,
				selections: [cursor(0, 3), cursor(2, 4)],
			},
		);
	});

	test("aborts everything if ANY scattered block would exceed heading 6", () => {
		const input = _t`
# a
b
###### c
`;
		// block A (# a) is fine, block B (###### c) is at 6 -> abort all.
		expect(runCommand(increase(), input, [cursor(0), cursor(2)])).toEqual({
			value: input,
			selections: [cursor(0), cursor(2)],
		});
	});
});

describe("increase heading (with sub-headings) command", () => {
	test("increases heading and all child subheadings until equal or higher heading", () => {
		const input = _t`
# H1
## H2-A
### H3-A1
body
## H2-B
`;
		// Cursor on ## H2-A (line 1)
		expect(
			runCommand(increase({ withSubHeadings: true }), input, [cursor(1, 2)]),
		).toEqual({
			value: _t`
# H1
### H2-A
#### H3-A1
body
## H2-B
`,
			selections: [cursor(1, 3)],
		});
	});

	test("aborts entire operation if any child heading is already at heading 6", () => {
		const input = _t`
## H2
### H3
###### H6
## Next H2
`;
		// Cursor on ## H2 (line 0)
		expect(
			runCommand(increase({ withSubHeadings: true }), input, [cursor(0, 2)]),
		).toEqual({
			value: input,
			selections: [cursor(0, 2)],
		});
	});

	test("handles multiple scattered selections with subheadings", () => {
		const input = _t`
## Section 1
### Sub 1
## Section 2
### Sub 2
`;
		// Cursor on ## Section 1 (line 0) and ## Section 2 (line 2)
		expect(
			runCommand(increase({ withSubHeadings: true }), input, [
				cursor(0, 2),
				cursor(2, 2),
			]),
		).toEqual({
			value: _t`
### Section 1
#### Sub 1
### Section 2
#### Sub 2
`,
			selections: [cursor(0, 3), cursor(2, 3)],
		});
	});

	test("handles overlapping parent and child selections without duplicate shift", () => {
		const input = _t`
## Section 1
### Sub 1
`;
		// Both Section 1 (line 0) and Sub 1 (line 1) are selected
		expect(
			runCommand(increase({ withSubHeadings: true }), input, [
				cursor(0, 2),
				cursor(1, 3),
			]),
		).toEqual({
			value: _t`
### Section 1
#### Sub 1
`,
			selections: [cursor(0, 3), cursor(1, 4)],
		});
	});
});

describe("decrease heading command", () => {
	test("decreases a heading above the lower limit", () => {
		expect(runCommand(decrease(), "## a", [cursor(0, 3)])).toEqual({
			value: "# a",
			selections: [cursor(0, 2)],
		});
	});

	test("decreases every heading in a range", () => {
		const input = _t`
## a
### b
`;
		expect(
			runCommand(decrease(), input, [
				range({ line: 0, ch: 3 }, { line: 1, ch: 4 }),
			]),
		).toEqual({
			value: _t`
# a
## b
`,
			selections: [range({ line: 0, ch: 2 }, { line: 1, ch: 3 })],
		});
	});

	test("aborts entirely when a block is already at the lower limit", () => {
		const input = _t`
# a
## b
`;
		expect(runCommand(decrease(), input, [range(0, 1)])).toEqual({
			value: input,
			selections: [range(0, 1)],
		});
	});

	test("aborts everything if ANY scattered block is at the lower limit", () => {
		const input = _t`
## a
b
# c
`;
		// block A (## a) could decrease, but block B (# c) is at the limit.
		expect(runCommand(decrease(), input, [cursor(0), cursor(2)])).toEqual({
			value: input,
			selections: [cursor(0), cursor(2)],
		});
	});
});

describe("decrease heading (with sub-headings) command", () => {
	test("decreases heading and all child subheadings until equal or higher heading", () => {
		const input = _t`
# H1
### H3-A
#### H4-A1
body
### H3-B
`;
		// Cursor on ### H3-A (line 1)
		expect(
			runCommand(decrease({ withSubHeadings: true }), input, [cursor(1, 3)]),
		).toEqual({
			value: _t`
# H1
## H3-A
### H4-A1
body
### H3-B
`,
			selections: [cursor(1, 2)],
		});
	});

	test("aborts entire operation if parent heading is already at lower limit", () => {
		const input = _t`
# H1
## H2
`;
		// Cursor on # H1 (line 0)
		expect(
			runCommand(decrease({ withSubHeadings: true }), input, [cursor(0, 1)]),
		).toEqual({
			value: input,
			selections: [cursor(0, 1)],
		});
	});

	test("handles multiple scattered selections with subheadings", () => {
		const input = _t`
### Section 1
#### Sub 1
### Section 2
#### Sub 2
`;
		// Cursor on ### Section 1 (line 0) and ### Section 2 (line 2)
		expect(
			runCommand(decrease({ withSubHeadings: true }), input, [
				cursor(0, 3),
				cursor(2, 3),
			]),
		).toEqual({
			value: _t`
## Section 1
### Sub 1
## Section 2
### Sub 2
`,
			selections: [cursor(0, 2), cursor(2, 2)],
		});
	});
});
