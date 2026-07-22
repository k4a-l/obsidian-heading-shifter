import { ApplyHeading } from "features/applyHeading/operation";
import { produce } from "immer";
import { DEFAULT_SETTINGS } from "settings";
import { describe, expect, test } from "vitest";
import { _t, cursor, range, runCommand } from "./helper";

const apply = (headingSize: number, settings = DEFAULT_SETTINGS) =>
	new ApplyHeading(settings, headingSize);

describe("apply heading command", () => {
	test("applies the given heading size to a single line", () => {
		expect(runCommand(apply(2), "a", [cursor(0)])).toBe("## a");
	});

	test("heading size 0 removes an existing heading", () => {
		expect(runCommand(apply(0), "## a", [cursor(0)])).toBe("a");
	});

	test("replaces an existing heading with the given size", () => {
		expect(runCommand(apply(3), "# a", [cursor(0)])).toBe("### a");
	});

	test("applies to every line of a selected range", () => {
		const input = _t`
a
b
c
`;
		expect(runCommand(apply(2), input, [range(0, 2)])).toBe(_t`
## a
## b
## c
`);
	});

	test("scattered blocks leave the lines between them untouched", () => {
		const input = _t`
a
b
c
`;
		expect(runCommand(apply(1), input, [cursor(0), cursor(2)])).toBe(_t`
# a
b
# c
`);
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
		expect(runCommand(apply(3), input, [range(1, 2), cursor(4)])).toBe(_t`
# a
### b
### c
d
### e
`);
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
		expect(runCommand(apply(2, sync), input, [cursor(1)])).toBe(_t`
a
\t- ## b
\t\t- c
`);
	});
});
