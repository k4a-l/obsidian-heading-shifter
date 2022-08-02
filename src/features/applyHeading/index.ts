import { Editor, MarkdownView, EditorPosition, Command } from "obsidian";

export type Heading = number;

export const applyHeading = (chunk: string, heading: Heading): string => {
	const remove = chunk.replace(/^#+ /, "");

	if (heading <= 0) return remove;
	return (
		new Array(heading).fill("#").reduce((prev, cur) => {
			return cur + prev;
		}, " ") + remove
	);
};

const applyHeadingCommand = (
	editor: Editor,
	view: MarkdownView,
	heading: Heading
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
	heading: Heading;

	constructor(heading: Heading) {
		this.heading = heading;
		this.command = {
			id: this.generateId(),
			name: this.generateName(),
			editorCallback: (editor: Editor, view: MarkdownView) => {
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
