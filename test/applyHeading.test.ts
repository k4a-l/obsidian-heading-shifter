import { ApplyHeading } from "features/applyHeading/operation";
import { produce } from "immer";
import { DEFAULT_SETTINGS } from "settings";
import { describe, expect, test } from "vitest";
import { _t, cursor, range, runCommand } from "./helper";

const apply = (headingSize: number, settings = DEFAULT_SETTINGS) =>
	new ApplyHeading(settings, headingSize);

describe("apply heading command", () => {
	test("applies the given heading size to a single line", () => {
		expect(runCommand(apply(2), "a", [cursor(0)])).toEqual({
			value: "## a",
			selections: [cursor(0, 3)],
		});
	});

	test("places cursor after heading prefix when applying to an empty line", () => {
		expect(runCommand(apply(2), "", [cursor(0)])).toEqual({
			value: "## ",
			selections: [cursor(0, 3)],
		});
	});

	test("preserves cursor position in the middle of a line", () => {
		expect(runCommand(apply(2), "abcde", [cursor(0, 2)])).toEqual({
			value: "## abcde",
			selections: [cursor(0, 5)],
		});
	});

	test("heading size 0 removes an existing heading", () => {
		expect(runCommand(apply(0), "## a", [cursor(0, 3)])).toEqual({
			value: "a",
			selections: [cursor(0, 0)],
		});
	});

	test("replaces an existing heading with the given size", () => {
		expect(runCommand(apply(3), "# a", [cursor(0, 2)])).toEqual({
			value: "### a",
			selections: [cursor(0, 4)],
		});
	});

	test("applies to every line of a selected range", () => {
		const input = _t`
a
b
c
`;
		expect(runCommand(apply(2), input, [range(0, 2)])).toEqual({
			value: _t`
## a
## b
## c
`,
			selections: [range({ line: 0, ch: 3 }, { line: 2, ch: 3 })],
		});
	});

	test("preserves inline selection range when applying heading", () => {
		expect(
			runCommand(apply(2), "abcde", [
				range({ line: 0, ch: 2 }, { line: 0, ch: 4 }),
			]),
		).toEqual({
			value: "## abcde",
			selections: [range({ line: 0, ch: 5 }, { line: 0, ch: 7 })],
		});
	});

	test("scattered blocks leave the lines between them untouched", () => {
		const input = _t`
a
b
c
`;
		expect(runCommand(apply(1), input, [cursor(0, 1), cursor(2, 1)])).toEqual({
			value: _t`
# a
b
# c
`,
			selections: [cursor(0, 3), cursor(2, 3)],
		});
	});

	// Scattered range + cursor: every selected line (plain or heading) gets the
	// fixed size; unselected lines stay.
	test("scenario: range + cursor apply the fixed size, others untouched", () => {
		const input = _t`
# a
b
## c
d
e
`;
		expect(runCommand(apply(3), input, [range(1, 2), cursor(4, 1)])).toEqual({
			value: _t`
# a
### b
### c
d
### e
`,
			selections: [range({ line: 1, ch: 4 }, { line: 2, ch: 0 }), cursor(4, 5)],
		});
	});

	test("sync with headings indents the list children under the heading", () => {
		const sync = produce(DEFAULT_SETTINGS, (draft) => {
			draft.list.childrenBehavior = "sync with headings";
		});
		// `a` sits at column 0 and is left untouched (cursor is on `b`).
		const input = _t`
a
- b
\t- c
`;
		expect(runCommand(apply(2, sync), input, [cursor(1)])).toEqual({
			value: _t`
a
\t- ## b
\t\t- c
`,
			selections: [cursor(1, 5)],
		});
	});
});
