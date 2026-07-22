import {
	InsertHeadingAtCurrentLevel,
	InsertHeadingAtDeeperLevel,
	InsertHeadingAtHigherLevel,
} from "features/insertHeading/operation";
import { produce } from "immer";
import { DEFAULT_SETTINGS } from "settings";
import { describe, expect, test } from "vitest";
import { _t, cursor, range, runCommand } from "./helper";

describe("insert heading commands", () => {
	// Scattered selection: range(1,3) under `# a` + cursor(6) under `### f`.
	// Each block follows its own section (inner `## c` is re-leveled too).
	describe("scenario: range + cursor across sections", () => {
		const input = _t`
# a
b
## c
d
e
### f
g
`;
		const selection = [range(1, 3), cursor(6)];

		test("current: each block follows its own section's level", () => {
			expect(
				runCommand(
					new InsertHeadingAtCurrentLevel(DEFAULT_SETTINGS),
					input,
					selection,
				),
			).toBe(_t`
# a
# b
# c
# d
e
### f
### g
`);
		});

		test("deeper: one level below each block's section", () => {
			expect(
				runCommand(
					new InsertHeadingAtDeeperLevel(DEFAULT_SETTINGS),
					input,
					selection,
				),
			).toBe(_t`
# a
## b
## c
## d
e
### f
#### g
`);
		});

		test("higher: one level above each section (clamped to H1)", () => {
			expect(
				runCommand(
					new InsertHeadingAtHigherLevel(DEFAULT_SETTINGS),
					input,
					selection,
				),
			).toBe(_t`
# a
# b
# c
# d
e
### f
## g
`);
		});
	});

	describe("a range collapses to its block's section level", () => {
		const input = _t`
# a
b
## c
d
### e
f
`;

		test("range from the top (no heading above) is clamped to H1", () => {
			expect(
				runCommand(new InsertHeadingAtCurrentLevel(DEFAULT_SETTINGS), input, [
					range(0, 2),
				]),
			).toBe(_t`
# a
# b
# c
d
### e
f
`);
		});

		test("range spanning sub-sections flattens inner headings to the outer level", () => {
			expect(
				runCommand(new InsertHeadingAtCurrentLevel(DEFAULT_SETTINGS), input, [
					range(2, 5),
				]),
			).toBe(_t`
# a
b
# c
# d
# e
# f
`);
		});
	});

	test("no previous heading still inserts a heading (clamped to H1)", () => {
		expect(
			runCommand(new InsertHeadingAtCurrentLevel(DEFAULT_SETTINGS), "a", [
				cursor(0),
			]),
		).toBe("# a");
	});

	test("aborts entirely when a block would exceed heading 6", () => {
		const input = _t`
###### a
b
`;
		expect(
			runCommand(new InsertHeadingAtDeeperLevel(DEFAULT_SETTINGS), input, [
				cursor(1),
			]),
		).toBe(input); // unchanged
	});

	// Pins the deliberate `higher` indent behavior: promoting the heading must NOT
	// drag the child list up — the child stays at the depth `current` produces.
	describe("sync with headings anchors the child list by depth, not by heading", () => {
		const sync = produce(DEFAULT_SETTINGS, (draft) => {
			draft.list.childrenBehavior = "sync with headings";
		});
		const input = _t`
### a
- b
\t- c
`;

		test("current keeps the child one level below the heading", () => {
			expect(
				runCommand(new InsertHeadingAtCurrentLevel(sync), input, [cursor(1)]),
			).toBe(_t`
### a
\t\t- ### b
\t\t\t- c
`);
		});

		test("higher promotes only the heading; child depth matches current", () => {
			expect(
				runCommand(new InsertHeadingAtHigherLevel(sync), input, [cursor(1)]),
			).toBe(_t`
### a
\t- ## b
\t\t\t- c
`);
		});
	});
});
