export type ModifierKey = "Ctrl" | "Shift" | "Alt" | "Meta";
export const simulateHotkey = (
	key: KeyboardEventInit["key"],
	modifiers: ModifierKey[] = [],
) => {
	const event = new KeyboardEvent("keydown", {
		key: key,
		code: key,
		ctrlKey: modifiers.includes("Ctrl"),
		shiftKey: modifiers.includes("Shift"),
		altKey: modifiers.includes("Alt"),
		metaKey: modifiers.includes("Meta"), // MacのCmdキー
	});
	document.activeElement?.dispatchEvent(event);
};
