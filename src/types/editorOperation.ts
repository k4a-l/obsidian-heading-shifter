import type { Command, Editor } from "obsidian";
import type { HeadingShifterSettings } from "settings";
import type { StopPropagation } from "./type";

export interface EditorOperation {
	settings: HeadingShifterSettings;
	editorCallback: (editor: Editor) => StopPropagation;
	createCommand: (pluginSetting: HeadingShifterSettings) => Command;
}
