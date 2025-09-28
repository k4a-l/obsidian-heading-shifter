import { applyHeading } from "features/applyHeading";
import { decreaseHeading, increaseHeading } from "features/shiftHeading/module";

const content = "headingShifter";

describe("apply heading", () => {
	test("Heading 0", () => {
		expect(applyHeading(`# ${content}`, 0)).toBe(`${content}`);
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
		expect(applyHeading(content, 6)).toBe(`###### ${content}`);
	});

	test("Heading 10", () => {
		expect(applyHeading(content, 10)).toBe(`########## ${content}`);
	});

	describe("With Replace", () => {
		test("default regexp", () => {
			expect(
				applyHeading(`**${content}**`, 0, {
					styleToRemove: {
						beginning: { ol: true, ul: false, userDefined: [] },
						surrounding: {
							bold: true,
							italic: false,
							userDefined: [],
						},
					},
				}),
			).toBe(`${content}`);
		});

		test("input regexp", () => {
			expect(
				applyHeading(`+ &&${content}&&`, 0, {
					styleToRemove: {
						beginning: {
							ol: true,
							ul: true,
							userDefined: [String.raw`\+ `],
						},
						surrounding: {
							bold: true,
							italic: true,
							userDefined: ["&&"],
						},
					},
				}),
			).toBe(`${content}`);
		});

		test("Not applicable when there is heading", () => {
			expect(
				applyHeading(`# **${content}**`, 0, {
					styleToRemove: {
						beginning: { ol: true, ul: false, userDefined: [] },
						surrounding: {
							bold: true,
							italic: false,
							userDefined: [],
						},
					},
				}),
			).toBe(`**${content}**`);
		});
	});
});

describe("increase heading", () => {
	test("Heading 0", () => {
		expect(increaseHeading(`${content}`)).toBe(`# ${content}`);
	});

	test("Heading 1", () => {
		expect(increaseHeading(`# ${content}`)).toBe(`## ${content}`);
	});

	test("Heading 4", () => {
		expect(increaseHeading(`#### ${content}`)).toBe(`##### ${content}`);
	});

	test("Heading 5", () => {
		expect(increaseHeading(`##### ${content}`)).toBe(`###### ${content}`);
	});

	test("Heading 10", () => {
		expect(increaseHeading(`########## ${content}`)).toBe(
			`########### ${content}`,
		);
	});
});

describe("decrease heading", () => {
	test("Heading 0", () => {
		expect(decreaseHeading(`${content}`)).toBe(`${content}`);
	});

	test("Heading 1", () => {
		expect(decreaseHeading(`# ${content}`)).toBe(`${content}`);
	});

	test("Heading 2", () => {
		expect(decreaseHeading(`## ${content}`)).toBe(`# ${content}`);
	});

	test("Heading 5", () => {
		expect(decreaseHeading(`##### ${content}`)).toBe(`#### ${content}`);
	});

	test("Heading 10", () => {
		expect(decreaseHeading(`########## ${content}`)).toBe(
			`######### ${content}`,
		);
	});
});
