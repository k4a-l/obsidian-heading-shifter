import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Editor, editorInfoField } from "obsidian";
import { StopPropagation } from "types/type";

export class ObsidianService {
	constructor() {}

	getEditorFromState(state: EditorState) {
		return state.field(editorInfoField).editor;
	}

	createKeymapRunCallback(config: {
		check?: (editor: Editor) => boolean;
		run: (editor: Editor) => StopPropagation;
	}) {
		const check = config.check || (() => true);
		const { run } = config;

		return (view: EditorView): boolean => {
			const editor = this.getEditorFromState(view.state);

			if (!editor) {
				return false;
			}

			if (!check(editor)) {
				return false;
			}

			const shouldStopPropagation = run(editor);

			return shouldStopPropagation;
		};
	}
}
