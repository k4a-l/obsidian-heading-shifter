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
				return regExpObj[k as keyof typeof regExpObj] ?? [];
			}
			return [];
		});
	};

	const bulletRegExp = /\s*(- \[.+\]|-|\*|[0-9]+)\s+/;
	const headingRegExp = /#+\s+/;

	const isBullet =
		settings?.list?.childrenBehavior === "sync with headings" &&
		bulletRegExp.test(chunk);

	let removed = chunk;

	// Remove any style only when it is not HEADING (because it may be daring to put it on when HEADING)
	if (!checkHeading(chunk)) {
		removed = settings?.styleToRemove
			? removeUsingRegexpStrings(chunk, {
					beginning: extractRegExp(
						{
							...settings.styleToRemove.beginning,
							ul: !isBullet && settings.styleToRemove.beginning.ul,
						},
						RegExpExample.beginning,
					),
					surrounding: extractRegExp(
						settings.styleToRemove.surrounding,
						RegExpExample.surrounding,
					),
				})
			: chunk;
	}

	const leadingMarkersRegExp = isBullet
		? new RegExp(
				`^(?:${bulletRegExp.source}${headingRegExp.source}|${bulletRegExp.source})`,
			)
		: new RegExp(`^${headingRegExp.source}`);

	let capturedBullet = "-";
	// Remove current leading markers
	const principleText = removed.replace(leadingMarkersRegExp, (match, p1) => {
		// Capture the bullet part if it exists
		if (isBullet && p1) {
			capturedBullet = p1;
		}
		return "";
	});

	// Make makers
	const bulletMarkers = `${"\t".repeat(Math.max(headingSize - 1, 0))}${capturedBullet} `;
	const headingMarkers =
		"#".repeat(Math.max(headingSize, 0)) + (headingSize > 0 ? " " : "");

	// Make marker to apply
	const leadingMarkers = isBullet
		? `${bulletMarkers}${headingMarkers}`
		: headingMarkers;

	return leadingMarkers + principleText;
};
