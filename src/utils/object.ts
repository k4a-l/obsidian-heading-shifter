export const assignUnknownObjectFromDefaultObject = <
	T extends Record<string, unknown>,
>(
	defaultObject: T,
	targetObject: Record<string, unknown>,
): T => {
	const newObj = structuredClone(targetObject);

	Object.entries(defaultObject).forEach(([k, v]) => {
		if (v === null) {
			return;
		}

		if (isPlainRecord(v)) {
			const newTargetObject = newObj[k];
			if (isPlainRecord(newTargetObject)) {
				newObj[k] = assignUnknownObjectFromDefaultObject(v, newTargetObject);
			} else {
				newObj[k] = v;
			}
			return;
		}

		if (newObj[k] === null || newObj[k] === undefined) {
			newObj[k] = v;
			return;
		}
	});

	return newObj as T;
};
function isPlainRecord(value: unknown): value is Record<string, unknown> {
	// まず、valueがオブジェクトであり、nullではないかを確認
	if (typeof value !== "object" || value === null) {
		return false;
	}

	// valueが配列、Map、Setなどの特殊なオブジェクトでないことを確認
	if (Array.isArray(value) || value instanceof Map || value instanceof Set) {
		return false;
	}

	// すべてのキーが文字列であることを確認
	for (const key in value) {
		if (typeof key !== "string") {
			return false;
		}
	}

	return true;
}

export const isObject = (obj: unknown): obj is Record<string, unknown> => {
	return typeof obj === "object" && obj !== null;
};
