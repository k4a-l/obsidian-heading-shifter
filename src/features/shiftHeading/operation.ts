import { Editor, Notice, Command } from "obsidian";
import { HeadingShifterSettings } from "settings";
import { StopPropagation } from "types/type";
import { composeLineChanges } from "utils/editorChange";
import { getHeadingLines } from "utils/markdown";
import { increaseHeading, decreaseHeading } from "./module";
import { EditorOperation } from "types/editorOperation";

export class IncreaseHeading implements EditorOperation {
	settings: HeadingShifterSettings;
	includesNoHeadingsLine: boolean;
	constructor(
		settings: HeadingShifterSettings,
		includesNoHeadingsLine: boolean
	) {
		this.settings = settings;
		this.includesNoHeadingsLine = includesNoHeadingsLine;
	}

	editorCallback = (editor: Editor): StopPropagation => {
		// Get the lines that contain heading
		const { headingLines, maxHeading } = getHeadingLines(
			editor,
			editor.getCursor("from").line,
			editor.getCursor("to").line,
			{
				includesNoHeadingsLine: this.includesNoHeadingsLine,
			}
		);

		// Do not increase If it contains more than heading 6 .
		if (maxHeading !== undefined && maxHeading >= 6) {
			new Notice("Cannot Increase (contains more than Heading 6)");
			return true;
		}

		const isOneline =
			editor.getCursor("from").line === editor.getCursor("to").line;

		// Dispatch Transaction
		const editorChange = composeLineChanges(
			editor,
			headingLines,
			increaseHeading,
			this.settings
		);
		editor.transaction({
			changes: editorChange,
		});

		// If only one line is targeted, move the cursor to the end of the line.
		if (isOneline) {
			editor.setCursor(editor.getCursor("anchor").line);
		}
		return editorChange.length ? true : false;
	};

	createCommand = (): Command => {
		return {
			id: `increase-heading${
				this.includesNoHeadingsLine ? "-forced" : ""
			}`,
			name: `Increase Headings${
				this.includesNoHeadingsLine ? "(forced)" : ""
			}`,
			icon: "headingShifter_increaseIcon",
			editorCallback: this.editorCallback,
		};
	};

	check = (): boolean => {
		return this.settings.overrideTab;
	};
}

export class DecreaseHeading implements EditorOperation {
	settings: HeadingShifterSettings;
	constructor(settings: HeadingShifterSettings) {
		this.settings = settings;
	}
	editorCallback = (editor: Editor) => {
		// Get the lines that contain heading
		const { headingLines, minHeading } = getHeadingLines(
			editor,
			editor.getCursor("from").line,
			editor.getCursor("to").line
		);

		// Do not decrease If it contains less than specified in the configuration heading.
		if (
			minHeading !== undefined &&
			minHeading <= Number(this.settings.limitHeadingFrom)
		) {
			new Notice(
				`Cannot Decrease (contains less than Heading${Number(
					this.settings.limitHeadingFrom
				)})`
			);
			return true;
		}

		// Dispatch Transaction
		const editorChange = composeLineChanges(
			editor,
			headingLines,
			decreaseHeading,
			this.settings
		);
		editor.transaction({
			changes: editorChange,
		});
		return editorChange.length ? true : false;
	};

	createCommand = () => {
		return {
			id: "decrease-heading",
			name: "Decrease Headings",
			icon: "headingShifter_decreaseIcon",
			editorCallback: this.editorCallback,
		};
	};

	check = (): boolean => {
		return this.settings.overrideTab;
	};
}
