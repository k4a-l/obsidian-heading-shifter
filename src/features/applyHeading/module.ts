import { HeadingShifterSettings } from "settings";

const regExp: Record<keyof HeadingShifterSettings["styleToRemove"], RegExp> =
	{ ol: new RegExp("\\d+\\."), ul: new RegExp("\\-|\\*") };

/**Return heading applied string from chunk
 * @return heading applied string
 * @params chunk - String to which heading is to be applied
 * @params headingSize - The Heading Size to be applied
 */
export const applyHeading = (
	chunk: string,
	headingSize: number,
	settings?: HeadingShifterSettings
): string => {
	const replacer = Object.entries(settings?.styleToRemove ?? {}).flatMap(
		([k, v]: [
			keyof HeadingShifterSettings["styleToRemove"],
			boolean
		]) => {
			return v ? regExp[k].source : [];
		}
	);

	const replaceStyleRegExp = new RegExp(`^(${replacer.join("|")}) `, "");

	const remove = chunk.replace(replaceStyleRegExp, "").replace(/^#+ /, "");

	if (headingSize <= 0) return remove;
	return (
		new Array(headingSize).fill("#").reduce((prev, cur) => {
			return cur + prev;
		}, " ") + remove
	);
};
