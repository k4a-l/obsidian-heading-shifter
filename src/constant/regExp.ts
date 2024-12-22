export const RegExpExample = {
	beginning: {
		ol: String.raw`\d+\. `,
		ul: String.raw`(?:\-|\*) `,
	},
	surrounding: {
		// Only one match
		italic: String.raw`(?:(?<!\*)\*(?!\*)|(?<!_)_(?!_))`,
		// Same
		// bold: String.raw`(?:\*\*|__)`,
		bold: String.raw`(?:(?<!\*)\*\*(?!\*)|(?<!_)__(?!_))`,
	},
};
