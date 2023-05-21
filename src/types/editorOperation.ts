import { Editor, Command } from "obsidian";
import { HeadingShifterSettings } from "settings";
import { StopPropagation } from "./type";

export interface EditorOperation {
	settings: HeadingShifterSettings;
	editorCallback: (editor: Editor) => StopPropagation;
	createCommand: (pluginSetting: HeadingShifterSettings) => Command;
}
