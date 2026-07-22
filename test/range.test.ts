import {
	createRange,
	mergeLineBlocks,
	selectionsToLineBlocks,
} from "utils/range";
import { describe, expect, test } from "vitest";

describe("createRange", () => {
	test("creates a sequential range", () => {
		expect(createRange(2, 3)).toStrictEqual([2, 3, 4]);
	});
	test("empty when count is 0", () => {
		expect(createRange(5, 0)).toStrictEqual([]);
	});
});

describe("mergeLineBlocks", () => {
	test("keeps scattered (disjoint) blocks separate", () => {
		expect(
			mergeLineBlocks([
				{ start: 0, end: 0 },
				{ start: 2, end: 2 },
			]),
		).toStrictEqual([
			{ start: 0, end: 0 },
			{ start: 2, end: 2 },
		]);
	});

	test("merges overlapping blocks", () => {
		expect(
			mergeLineBlocks([
				{ start: 0, end: 2 },
				{ start: 1, end: 3 },
			]),
		).toStrictEqual([{ start: 0, end: 3 }]);
	});

	test("merges adjacent blocks (no gap between them)", () => {
		expect(
			mergeLineBlocks([
				{ start: 0, end: 1 },
				{ start: 2, end: 3 },
			]),
		).toStrictEqual([{ start: 0, end: 3 }]);
	});

	test("sorts unordered input", () => {
		expect(
			mergeLineBlocks([
				{ start: 5, end: 5 },
				{ start: 0, end: 0 },
			]),
		).toStrictEqual([
			{ start: 0, end: 0 },
			{ start: 5, end: 5 },
		]);
	});
});

describe("selectionsToLineBlocks", () => {
	test("normalizes anchor/head order (selected upward)", () => {
		expect(
			selectionsToLineBlocks([{ anchor: { line: 3 }, head: { line: 1 } }]),
		).toStrictEqual([{ start: 1, end: 3 }]);
	});

	test("keeps scattered multi-cursors as separate blocks", () => {
		expect(
			selectionsToLineBlocks([
				{ anchor: { line: 5 }, head: { line: 5 } },
				{ anchor: { line: 0 }, head: { line: 0 } },
			]),
		).toStrictEqual([
			{ start: 0, end: 0 },
			{ start: 5, end: 5 },
		]);
	});

	test("merges overlapping selections", () => {
		expect(
			selectionsToLineBlocks([
				{ anchor: { line: 0 }, head: { line: 2 } },
				{ anchor: { line: 3 }, head: { line: 1 } },
			]),
		).toStrictEqual([{ start: 0, end: 3 }]);
	});
});
