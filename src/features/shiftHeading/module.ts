import { applyHeading } from "features/applyHeading";
import { checkHeading } from "utils/markdown";

const shiftHeading = (chunk: string, dir: 1 | -1): string => {
	const heading = checkHeading(chunk);
	return applyHeading(chunk, heading + dir);
};

export const increaseHeading = (chunk: string) => {
	return shiftHeading(chunk, 1);
};

export const decreaseHeading = (chunk: string) => {
	return shiftHeading(chunk, -1);
};
