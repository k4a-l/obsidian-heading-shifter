import { applyHeading } from "features/applyHeading";
import { HeadingShifterSettings } from "settings";
import { checkHeading } from "utils/markdown";

const shiftHeading = (
	chunk: string,
	dir: 1 | -1,
	settings?: HeadingShifterSettings
): string => {
	const heading = checkHeading(chunk);
	return applyHeading(chunk, heading + dir, settings);
};

export const increaseHeading = (
	chunk: string,
	settings?: HeadingShifterSettings
) => {
	return shiftHeading(chunk, 1, settings);
};

export const decreaseHeading = (
	chunk: string,
	settings?: HeadingShifterSettings
) => {
	return shiftHeading(chunk, -1, settings);
};
