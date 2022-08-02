import { Editor, MarkdownView, Command, EditorPosition } from "obsidian";
import { applyHeading } from "./module";

const applyHeadingCommand = (
	editor: Editor,
	view: MarkdownView,
	heading: number
) => {
	const pos = editor.getCursor();
	const line = editor.getCursor().line;
	const lineContent = editor.getLine(line);
	const edited = applyHeading(lineContent, heading);
	const start: EditorPosition = { ...pos, ch: 0 };
	const end: EditorPosition = { ...pos, ch: lineContent.length };
	editor.replaceRange(edited, start, end);
};

export class ApplyHeading {
	heading: number;

	constructor(heading: number) {
		this.heading = heading;
		this.command = {
			id: this.generateId(),
			name: this.generateName(),
			editorCallback: (editor: Editor, view: MarkdownView) => {
				if (
					editor.getCursor("from").line! !=
					editor.getCursor("to").line
				) {
					return;
				}
				this.editorCallback(editor, view);
			},
		};
	}

	private generateId() {
		return `apply-heading${this.heading}`;
	}

	private generateName() {
		return `Apply Heading ${this.heading}`;
	}

	private editorCallback(editor: Editor, view: MarkdownView) {
		applyHeadingCommand(editor, view, this.heading);
	}

	command: Command;
}
