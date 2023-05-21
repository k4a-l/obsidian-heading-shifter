import { HeadingShifterSettings } from "settings";

/**Return heading applied string from chunk
 * @return heading applied string
 * @params chunk - String to which heading is to be applied
 * @params headingSize - The Heading Size to be applied
 */
	chunk: string,
	headingSize: number,
	settings?: HeadingShifterSettings

	if (headingSize <= 0) return remove;
	return (
		new Array(headingSize).fill("#").reduce((prev, cur) => {
			return cur + prev;
		}, " ") + remove
	);
};
