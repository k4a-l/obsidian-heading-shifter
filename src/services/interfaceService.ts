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
	icon_heading_menu,
	icon_increase_heading,
	icon_insert_heading_at_current_level,
	icon_insert_heading_at_deeper_level,
	icon_insert_heading_at_higher_level,
} from "ui/icon";

export class InterfaceService {
	// constructor() {}
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
		addIcon(
			"headingShifter_insertHeadingAtCurrentLevel",
			icon_insert_heading_at_current_level,
		);
		addIcon(
			"headingShifter_insertHeadingAtDeeperLevel",
			icon_insert_heading_at_deeper_level,
		);
		addIcon(
			"headingShifter_insertHeadingAtHigherLevel",
			icon_insert_heading_at_higher_level,
		);
		addIcon("headingShifter_headingMenu", icon_heading_menu);
	};

	exec() {
		this.addIcons();
	}
}
