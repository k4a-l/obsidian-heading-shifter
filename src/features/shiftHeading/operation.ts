import { Editor, View, Notice, Command } from "obsidian";
import { HeadingShifterSettings } from "settings";
import { icon_increase_heading } from "ui/icon";
import { composeLineChanges } from "utils/editorChange";
import { getHeadingLines } from "utils/markdown";
import { increaseHeading, decreaseHeading } from "./module";

export const createIncreaseHeadingCommand = (
	pluginSetting: HeadingShifterSettings
): Command => {
	const createEditorCallback = () => {
		return (editor: Editor, view: View) => {
			// Get the lines that contain heading
			const { headingLines, maxHeading } = getHeadingLines(
				editor,
				editor.getCursor("from").line,
				editor.getCursor("to").line
			);

			// Do not increase If it contains more than heading 6 .
			if (maxHeading !== undefined && maxHeading >= 6) {
				return new Notice(
					"Cannot Increase (contains more than Heading 6)"
				);
			}

			// Dispatch Transaction
			editor.transaction({
				changes: composeLineChanges(
					editor,
					headingLines,
					increaseHeading
				),
			});
		};
	};

	// return CommandObject
	return {
		id: "increase-heading",
		name: "Increase Headings",
		icon: "headingShifter_increaseIcon",
		editorCallback: createEditorCallback(),
	};
};

export const createDecreaseHeadingCommand = (
	pluginSetting: HeadingShifterSettings
): Command => {
	const createEditorCallback = (settings: HeadingShifterSettings) => {
		return (editor: Editor, view: View) => {
			// Get the lines that contain heading
			const { headingLines, minHeading } = getHeadingLines(
				editor,
				editor.getCursor("from").line,
				editor.getCursor("to").line
			);

			// Do not decrease If it contains less than specified in the configuration heading.
			if (
				minHeading !== undefined &&
				minHeading <= Number(settings.limitHeadingFrom)
			) {
				return new Notice(
					`Cannot Decrease (contains less than Heading${Number(
						settings.limitHeadingFrom
					)})`
				);
			}

			// Dispatch Transaction
			editor.transaction({
				changes: composeLineChanges(
					editor,
					headingLines,
					decreaseHeading
				),
			});
		};
	};

	// return CommandObject
	return {
		id: "decrease-heading",
		name: "Decrease Headings",
		icon: "headingShifter_decreaseIcon",
		editorCallback: createEditorCallback(pluginSetting),
	};
};
