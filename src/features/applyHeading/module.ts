/* eslint-disable no-mixed-spaces-and-tabs */
import { RegExpExample } from "constant/regExp";
import type { HeadingShifterSettings } from "settings";
import { checkHeading, removeUsingRegexpStrings } from "utils/markdown";

/**Return heading applied string from chunk
 * @return heading applied string
 * @params chunk - String to which heading is to be applied
 * @params headingSize - The Heading Size to be applied
 */
export const applyHeading = (
	chunk: string,
	headingSize: number,
	settings?: Partial<HeadingShifterSettings>,
): string => {
	const extractRegExp = (
		settingObj: Record<string, boolean | string[]>,
		regExpObj: Record<string, string>,
	): string[] => {
		return Object.entries(settingObj ?? {}).flatMap(([k, v]) => {
			if (Array.isArray(v)) {
				return v;
			}
			if (k in regExpObj && v === true) {
				return regExpObj[k as keyof typeof regExpObj];
			}
			return [];
		});
	};

	// Check if the original chunk is a bulleted list
	const isBulleted = settings?.autoIndentBulletedHeader
		? /^\s*[-] /.test(chunk)
		: false;

	let removed = chunk;

	// Remove any style only when it is not HEADING (because it may be daring to put it on when HEADING)
	if (!checkHeading(chunk)) {
		removed = settings?.styleToRemove
			? removeUsingRegexpStrings(chunk, {
					beginning: extractRegExp(
						settings.styleToRemove.beginning,
						RegExpExample.beginning,
					),
					surrounding: extractRegExp(
						settings.styleToRemove.surrounding,
						RegExpExample.surrounding,
					),
				})
			: chunk;
	}

	// Once all headings are set to 0
	removed = removed.replace(/^#+ /, "");

	if (headingSize <= 0) {
		return settings?.autoIndentBulletedHeader
			? removed.replace(/^\s*[-] #*\s*/, "- ")
			: removed;
	}
	const headingMarkers = new Array(headingSize)
		.fill("#")
		.reduce((prev, cur) => {
			return cur + prev;
		}, " ");

	// If auto indenting bulleted headers is enabled and chunk was bulleted, prepend tabs equal to headingSize
	if (isBulleted) {
		return (
			"\t".repeat(Math.max(headingSize - 1, 0)) +
			"- " +
			headingMarkers +
			removed.replace(/^\s*[-] #*\s*/, "")
		);
	}

	return headingMarkers + removed;
};
