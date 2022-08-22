export interface HeadingShifterSettings {
	limitHeadingFrom: number;
	overrideTab: boolean;
}

export const DEFAULT_SETTINGS: HeadingShifterSettings = {
	limitHeadingFrom: 1,
	overrideTab: false,
};
