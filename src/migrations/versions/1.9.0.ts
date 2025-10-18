import type { SettingsObject } from "migrations/type";

type HeadingShifterSettings_1_9_0 = {
	version: string;
	limitHeadingFrom: number;
	overrideTab: boolean;
	styleToRemove: {
		beginning: { ul: boolean; ol: boolean; userDefined: string[] };
		surrounding: { bold: boolean; italic: boolean; userDefined: string[] };
	};
	autoOutdent: {
		enable: boolean;
		hotKey: {
			key: string;
			shift: boolean;
			ctrl: boolean;
			alt: boolean;
		};
	};
	autoIndentBulletedHeader: boolean;
};

const DEFAULT_SETTINGS_1_9_0: HeadingShifterSettings_1_9_0 = {
	version: "1.9.0",
	limitHeadingFrom: 1,
	overrideTab: false,
	styleToRemove: {
		beginning: { ul: true, ol: true, userDefined: [] },
		surrounding: { bold: false, italic: false, userDefined: [] },
	},
	autoOutdent: {
		enable: true,
		hotKey: {
			key: "Tab",
			shift: true,
			ctrl: false,
			alt: false,
		},
	},
	autoIndentBulletedHeader: false,
};

export const settings_1_9_0: SettingsObject<HeadingShifterSettings_1_9_0> = {
	oldDefaultSettings: { version: "0.0.0" },
	defaultSettings: DEFAULT_SETTINGS_1_9_0,
	migration: () => DEFAULT_SETTINGS_1_9_0,
};
