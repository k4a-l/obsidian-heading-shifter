import { addIcon } from "obsidian";
import { ICONS } from "ui/icon";

export class InterfaceService {
	// constructor() {}
	addIcons = () => {
		Object.values(ICONS).forEach(({ id, svg }) => {
			addIcon(id, svg);
		});
	};

	exec() {
		this.addIcons();
	}
}
