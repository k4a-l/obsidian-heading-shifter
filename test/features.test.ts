import { applyHeading } from "features/applyHeading";
import { decreaseHeading, increaseHeading } from "features/shiftHeading/module";
import { produce } from "immer";
import { DEFAULT_SETTINGS, type HeadingShifterSettings } from "settings";

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

	describe("With Auto Indent", () => {
		const autoIndentSettings: Partial<HeadingShifterSettings> = {
			autoIndentBulletedHeader: true,
		};

		test("list to 0", () => {
			const input = `- ${content}`;
			const output = input; // only bullet(not changed)
			expect(applyHeading(input, 0, autoIndentSettings)).toBe(output);
		});

		test("list to 5", () => {
			const input = `\t\t\t\t\t- ${content}`;
			const output = `\t\t\t\t- ##### ${content}`; // indent4 + #5
			expect(applyHeading(input, 5, autoIndentSettings)).toBe(output);
		});

		test("multiple to 3", () => {
			const input = `\t\t\t- ##### ${content}`;
			const output = `\t\t- ### ${content}`; // indent2 + #3
			expect(applyHeading(input, 3, autoIndentSettings)).toBe(output);
		});

		test("multiple to 0", () => {
			const input = `\t\t- ### ${content}`;
			const output = `- ${content}`; // only bullet
			expect(applyHeading(input, 0, autoIndentSettings)).toBe(output);
		});

		// It overlaps with other tests, but just in case
		test("Without bullet", () => {
			const input = `#### ${content}`;
			const output = `## ${content}`; // only #2
			expect(applyHeading(input, 2, autoIndentSettings)).toBe(output);
		});

		test("with style to remove", () => {
			const input = `- # a`;
			const output = `\t- ## a`; // skip remove
			expect(
				applyHeading(
					input,
					2,
					produce(autoIndentSettings, (draft) => {
						draft.styleToRemove = produce(
							DEFAULT_SETTINGS.styleToRemove,
							(draft) => {
								draft.beginning.ul = true;
							},
						);
					}),
				),
			).toBe(output);
		});

		describe("Without auto indent setting", () => {
			test("Applied without being removed(Not recognized as a valid heading)", () => {
				const input = `\t- ## ${content}`;
				const output = `#### ${input}`; // h4 ${input}
				expect(applyHeading(input, 4)).toBe(output);
			});

			test("Applied after removal", () => {
				const input = `## ${content}`;
				const output = `#### ${content}`; // indent4 + #5
				expect(applyHeading(input, 4)).toBe(output);
			});
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
