import { produce } from "immer";
import { DEFAULT_SETTINGS, type HeadingShifterSettings } from "../settings";
import {
	assignUnknownObjectFromDefaultObject,
	isObject,
} from "../utils/object";
import type { MigrationObject } from "./type";

// この機能は1.9.0->1.10.0での導入のため、1.9.0から適用
const BASE_VERSION = "1.9.0";

import semver from "semver";

export const migrateSettings = ({
	settings: rawSettings,
	latestVersion,
	migrationObject,
}: {
	settings: unknown;
	latestVersion: string;
	migrationObject: MigrationObject;
}): HeadingShifterSettings => {
	if (!isObject(rawSettings)) {
		return DEFAULT_SETTINGS;
	}

	const currentVersion =
		"version" in rawSettings && typeof rawSettings.version === "string"
			? rawSettings.version
			: BASE_VERSION;

	// バージョンが超えていたら現在に適用
	if (semver.gt(currentVersion, latestVersion)) {
		const merged = assignUnknownObjectFromDefaultObject(
			DEFAULT_SETTINGS,
			rawSettings,
		);

		return produce(merged, (draft) => {
			draft.version = latestVersion;
		});
	}

	// 現行バージョン以降のマイグレーション
	const migrationVersions = Object.entries(migrationObject)
		.filter(([k]) => semver.gt(k, currentVersion))
		.sort((a, b) => semver.compare(a[0], b[0]));

	const migratedSettings = migrationVersions.reduce(
		(accSettings, [_version, settingObj]) => {
			// 1個前の設定値を矯正
			const mergedOld = assignUnknownObjectFromDefaultObject(
				settingObj.oldDefaultSettings,
				accSettings.settings,
			);

			const newSettings = settingObj.migration(mergedOld);

			return {
				settings: newSettings,
				default: settingObj.defaultSettings,
			};
		},
		{ default: rawSettings, settings: rawSettings } as {
			default: Record<string, unknown>;
			settings: { version: string };
		},
	);

	return migratedSettings.settings as HeadingShifterSettings;
};
