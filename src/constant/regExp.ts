export const RegExpExample = {
	head: {
		ol: String.raw`\d+\.`,
		ul: String.raw`(?:\-|\*)`,
	},
	surround: {
		// Only one match
		italic: String.raw`(?:(?<!\*)\*(?!\*)|(?<!_)_(?!_))`,
		// Same
		// bold: String.raw`(?:\*\*|__)`,
		bold: String.raw`(?:(?<!\*)\*\*(?!\*)|(?<!_)__(?!_))`,
	},
};
