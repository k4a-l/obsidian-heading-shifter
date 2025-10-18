import type { SettingsObject } from "migrations/type";
import { settings_1_9_0 } from "./1.9.0";

type LIST_BEHAVIOR_1_10_0 = "outdent to zero" | "sync with headings" | "noting";

type HeadingShifterSettings_1_10_0 = {
	version: string;
	limitHeadingFrom: number;
	overrideTab: boolean;
	styleToRemove: {
		beginning: { ul: boolean; ol: boolean; userDefined: string[] };
		surrounding: { bold: boolean; italic: boolean; userDefined: string[] };
	};
	list: { childrenBehavior: LIST_BEHAVIOR_1_10_0 };
	editor: { tabSize: number };
};

const DEFAULT_SETTINGS_1_10_0: HeadingShifterSettings_1_10_0 = {
	version: "1.10.0",
	limitHeadingFrom: 1,
	overrideTab: false,
	styleToRemove: {
		beginning: { ul: true, ol: true, userDefined: [] },
		surrounding: { bold: false, italic: false, userDefined: [] },
	},
	list: { childrenBehavior: "outdent to zero" },
	editor: {
		tabSize: 4,
	},
};

const migration_1_10_0 = (
	oldSettings: typeof settings_1_9_0.defaultSettings,
): HeadingShifterSettings_1_10_0 => {
	const newSettings: HeadingShifterSettings_1_10_0 = {
		...DEFAULT_SETTINGS_1_10_0,
		list: {
			childrenBehavior: oldSettings.autoIndentBulletedHeader
				? "sync with headings"
				: oldSettings.autoOutdent.enable
					? "outdent to zero"
					: "noting",
		},
	};

	return newSettings;
};

export const settings_1_10_0: SettingsObject<HeadingShifterSettings_1_10_0> = {
	defaultSettings: DEFAULT_SETTINGS_1_10_0,
	oldDefaultSettings: settings_1_9_0.defaultSettings,
	migration: migration_1_10_0,
};
