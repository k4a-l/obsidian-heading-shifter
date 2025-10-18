import { settings_1_10_0 } from "./versions/1.10.0";

export type SettingsObject<
	S extends { version: string } = { version: string },
	OS extends { version: string } = { version: string },
> = {
	oldDefaultSettings: OS;
	defaultSettings: S;
	migration: (oldSettings: unknown) => S;
};

export type MigrationObject = Record<string, SettingsObject>;

export const MIGRATION_OBJECT = {
	"1.10.0": settings_1_10_0,
} satisfies MigrationObject;
