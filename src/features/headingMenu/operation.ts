import { type Command, type Editor, Menu, Platform } from "obsidian";
import type { StopPropagation } from "types/type";
import type { MinimumEditor } from "utils/editorChange";

/** The subset of a Command that OpenHeadingMenu needs to render a menu item
 * and run the underlying operation. */
type MenuCommand = Pick<Command, "name" | "icon"> & {
	editorCallback: (editor: MinimumEditor) => StopPropagation;
};

/** `Editor.coordsAtPos` is not part of Obsidian's public API (it's exposed by
 * the underlying CodeMirror instance), so it may disappear in a future
 * version. Guard it at runtime and fall back to the viewport center instead
 * of casting it away with `any`. */
type EditorWithCoords = Editor & {
	coordsAtPos: (
		pos: ReturnType<Editor["getCursor"]>,
	) => { left: number; top: number; bottom: number } | null;
};

const hasCoordsAtPos = (editor: Editor): editor is EditorWithCoords =>
	typeof (editor as Partial<EditorWithCoords>).coordsAtPos === "function";

const getMenuPosition = (editor: Editor): { x: number; y: number } => {
	if (hasCoordsAtPos(editor)) {
		const coords = editor.coordsAtPos(editor.getCursor());
		if (coords) {
			return { x: coords.left, y: coords.bottom };
		}
	}
	return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
};

/** Open a single menu that lists every Heading Shifter command, so mobile users
 * can register just this one command on their command ribbon instead of one
 * icon per heading operation. */
export class OpenHeadingMenu {
	commands: MenuCommand[];

	constructor(commands: MenuCommand[]) {
		this.commands = commands;
	}

	editorCallback = (editor: Editor): StopPropagation => {
		const menu = new Menu();

		for (const command of this.commands) {
			menu.addItem((item) => {
				item.setTitle(command.name);
				if (command.icon) {
					item.setIcon(command.icon);
				}
				item.onClick(() => command.editorCallback(editor));
			});
		}

		const position = getMenuPosition(editor);
		// Close the on-screen keyboard first so it doesn't cover the menu drawer,
		// then bring it back once the menu closes.
		if (Platform.isMobile) {
			editor.blur();
			menu.onHide(() => editor.focus());
		}
		menu.showAtPosition(position);

		return true;
	};

	createCommand = (): Command => {
		return {
			id: "heading-shifter-menu",
			name: "Heading Shifter menu",
			icon: "headingShifter_headingMenu",
			editorCallback: this.editorCallback,
		};
	};
}
