export const RegExpExample = {
	ol: String.raw`^\d+\. (.*)`,
	ul: String.raw`^(?:\-|\*) (.*)`,
	bold: String.raw`(?:\*\*|__)(.*?)(?:\*\*|__)`,
	italic: String.raw`(?:\*|_)(.*?)(?:\*|_)`,
};
