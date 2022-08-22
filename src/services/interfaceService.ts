import { addIcon } from "obsidian";
import {
	icon_decrease_heading,
	icon_heading_0,
	icon_heading_1,
	icon_heading_2,
	icon_heading_3,
	icon_heading_4,
	icon_heading_5,
	icon_heading_6,
	icon_increase_heading,
} from "ui/icon";

export class InterfaceService {
	constructor() {}
	addIcons = () => {
		addIcon("headingShifter_decreaseIcon", icon_decrease_heading);
		addIcon("headingShifter_increaseIcon", icon_increase_heading);
		addIcon("headingShifter_heading0", icon_heading_0);
		addIcon("headingShifter_heading1", icon_heading_1);
		addIcon("headingShifter_heading2", icon_heading_2);
		addIcon("headingShifter_heading3", icon_heading_3);
		addIcon("headingShifter_heading4", icon_heading_4);
		addIcon("headingShifter_heading5", icon_heading_5);
		addIcon("headingShifter_heading6", icon_heading_6);
	};

	exec() {
		this.addIcons();
	}
}
