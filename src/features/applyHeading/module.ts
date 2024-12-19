import { HeadingShifterSettings } from "settings";
import { removeFromRegExpStrings } from "utils/markdown";

const regExp: Record<keyof HeadingShifterSettings["styleToRemove"], RegExp> = {
	ol: new RegExp("\\d+\\. (.*)"),
	ul: new RegExp("\\-|\\* (.*)"),
};

/**Return heading applied string from chunk
 * @return heading applied string
 * @params chunk - String to which heading is to be applied
 * @params headingSize - The Heading Size to be applied
 */
export const applyHeading = (
	chunk: string,
	headingSize: number,
	settings?: Partial<HeadingShifterSettings>
): string => {
	const removed = removeFromRegExpStrings(chunk, [
		...Object.entries(settings?.styleToRemove ?? {}).flatMap(
			([k, v]: [
				keyof HeadingShifterSettings["styleToRemove"],
				boolean
			]) => {
				return v ? regExp[k].source : [];
			}
		),
		...(settings?.stylesToRemove ?? []),
	]);

	if (headingSize <= 0) return removed;
	return (
		new Array(headingSize).fill("#").reduce((prev, cur) => {
			return cur + prev;
		}, " ") + removed
	);
};
