import { produce } from "immer";
import { migrateSettings } from "migrations/migration";
import {
	MIGRATION_OBJECT,
	type MigrationObject,
	type SettingsObject,
} from "migrations/type";
import { DEFAULT_SETTINGS } from "settings";

import { describe, expect, test } from "vitest";

describe("migrateSettings", () => {
	const DUMMY_VERSION = "1.2.3";
	test("should return default settings if settings is not an object", () => {
		const result = migrateSettings({
			settings: "not an object",
			latestVersion: DUMMY_VERSION,
			migrationObject: MIGRATION_OBJECT,
		});
		expect(result).toStrictEqual(DEFAULT_SETTINGS);
	});

	test("should return merged settings if version is newer than latest", () => {
		const newerSettings = produce(DEFAULT_SETTINGS, (draft) => {
			draft.version = "99.9.9";
			(draft as unknown as Record<string, unknown>).newField = "test";
		});

		const result = migrateSettings({
			settings: newerSettings,
			latestVersion: DEFAULT_SETTINGS.version,
			migrationObject: MIGRATION_OBJECT,
		});
		expect(result).toStrictEqual(
			expect.objectContaining({ ...DEFAULT_SETTINGS, newField: "test" }),
		);
	});

	test("should migrate from 1.9.0 to 1.10.0", () => {
		const oldSettings_1_9_0 = {
			overrideTab: true,
			autoIndentBulletedHeader: true,
			autoOutdent: {
				enable: true,
			},
		};

		const result = migrateSettings({
			settings: oldSettings_1_9_0,
			latestVersion: "1.10.0",
			migrationObject: MIGRATION_OBJECT,
		});

		const expected = produce(DEFAULT_SETTINGS, (draft) => {
			draft.overrideTab = true;
			draft.version = "1.10.0";
			draft.list.childrenBehavior = "sync with headings";
		});

		expect(result).toStrictEqual(expected);
	});

	test("should migrate multiple", () => {
		const firstSettings = { props_1_1_0: 110 };

		const d1_1_1 = { version: "1.1.1", props_1_1_1: 111 };
		const s1_1_1 = {
			oldDefaultSettings: { version: "0.0.0" },
			defaultSettings: d1_1_1,
			migration: (old: typeof firstSettings) => {
				return { ...old, version: d1_1_1.version, props_1_1_1: 111 };
			},
		} satisfies SettingsObject<typeof d1_1_1>;

		const d1_2_3 = { version: "1.1.1", props_1_2_3: { v: "1.2.3" } };
		const s1_2_3 = {
			oldDefaultSettings: d1_1_1,
			defaultSettings: d1_2_3,
			migration: (old: typeof d1_1_1) => {
				return { ...old, props_1_2_3: d1_2_3.props_1_2_3 };
			},
		} satisfies SettingsObject<typeof d1_2_3>;

		const d2_0_0 = {
			version: "2.0.0",
			props_1_2_3: { v: "1.2.3" },
			props_2_0_0: 200,
		};
		const s2_0_0 = {
			oldDefaultSettings: d1_2_3,
			defaultSettings: d2_0_0,
			migration: (old: typeof d1_2_3) => {
				return {
					version: d2_0_0.version,
					props_1_2_3: old.props_1_2_3, // use old props
					props_2_0_0: d2_0_0.props_2_0_0,
				};
			},
		} satisfies SettingsObject<typeof d2_0_0>;

		const dummyMigrationObject: MigrationObject = {
			"2.0.0": s2_0_0,
			"1.1.1": s1_1_1,
			"1.2.3": s1_2_3,
		};

		const result = migrateSettings({
			settings: firstSettings,
			latestVersion: "2.0.0",
			migrationObject: dummyMigrationObject,
		});

		const expected = d2_0_0;
		expect(result).toStrictEqual(expected);
	});
});
