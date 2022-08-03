import { text } from "stream/consumers";
import { checkFence, checkHeading } from "utils/check";

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
	test("match", () => {
		expect(checkFence("```")).toBeTruthy();
	});

	test("unmatch", () => {
		expect(checkFence("``")).toBeFalsy();
	});
});
