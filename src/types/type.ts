export type StopPropagation = boolean;
export const HEADINGS = [0, 1, 2, 3, 4, 5, 6];
export const HEADING_OPTIONS = Object.fromEntries(
	HEADINGS.map((heading) => [String(heading), String(heading)]),
);
