import { Editor, View, Notice } from "obsidian";
import { HeadingShifterSettings } from "settings";
import { composeLineChanges } from "utils/editorChange";
import { getHeadingLines } from "utils/markdown";
import { increaseHeading, decreaseHeading } from "./module";

export const createIncreaseHeadingCommand = (
	pluginSetting: HeadingShifterSettings
) => {
	return {
		id: "increase-heading",
		name: "Increase Headings",
		editorCallback: (editor: Editor, view: View) => {
			const { headingLines, maxHeading } = getHeadingLines(
				editor,
				editor.getCursor("from").line,
				editor.getCursor("to").line
			);

			if (maxHeading !== undefined && maxHeading >= 5) {
				return new Notice(
					"Cannot Increase (contains more than Heading 5)"
				);
			}

			editor.transaction({
				changes: composeLineChanges(
					editor,
					headingLines,
					increaseHeading
				),
			});
		},
	};
};

export const createDecreaseHeadingCommand = (
	pluginSetting: HeadingShifterSettings
) => {
	return {
		id: "decrease-heading",
		name: "Decrease Headings",
		editorCallback: (editor: Editor, view: View) => {
			const { headingLines, minHeading } = getHeadingLines(
				editor,
				editor.getCursor("from").line,
				editor.getCursor("to").line
			);

			if (
				minHeading !== undefined &&
				minHeading <= Number(pluginSetting.limitHeadingFrom)
			) {
				return new Notice(
					`Cannot Decrease (contains less than Heading${pluginSetting.limitHeadingFrom})`
				);
			}

			editor.transaction({
				changes: composeLineChanges(
					editor,
					headingLines,
					decreaseHeading
				),
			});
		},
	};
};
