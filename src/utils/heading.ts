import { Editor } from "obsidian";
import { checkHeading } from "./check";
import { setMin, setMax } from "./range";

export const getHeadingLines = (editor: Editor, from: number, to: number) => {
	let headingLines: number[] = [];
	let minHeading: undefined | number = undefined;
	let maxHeading: undefined | number = undefined;

	for (let line = Math.min(from, to); line <= Math.max(from, to); line++) {
		const heading = checkHeading(editor.getLine(line));
		if (heading > 0) {
			headingLines.push(line);
			minHeading = setMin(minHeading, heading);
			maxHeading = setMax(maxHeading, heading);
		}
	}
	return { headingLines, minHeading, maxHeading };
};
