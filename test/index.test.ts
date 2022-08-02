import { applyHeading } from "features/applyHeading";

const content = "headingShifter";

describe("apply heading", () => {
	test("Heading 0", () => {
		expect(applyHeading(content, 0)).toBe(`${content}`);
	});
	test("Heading 1", () => {
		expect(applyHeading(content, 1)).toBe(`# ${content}`);
	});
	test("Heading 2", () => {
		expect(applyHeading(content, 2)).toBe(`## ${content}`);
	});
	test("Heading 5", () => {
		expect(applyHeading(content, 5)).toBe(`##### ${content}`);
	});
	test("Heading 6", () => {
		expect(applyHeading(content, 6)).toBe(`##### ${content}`);
	});
});

describe("increase heading", () => {});
