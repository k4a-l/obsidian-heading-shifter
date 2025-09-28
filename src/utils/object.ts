export const assignUnknownObjectFromDefaultObject = (
	defaultObject: Record<string, unknown>,
	targetObject: Record<string, unknown>,
) => {
	Object.entries(defaultObject).forEach(([k, v]) => {
		if (v === null) {
			return;
		}

		if (isPlainRecord(v)) {
			const newTargetObject = targetObject[k];
			if (isPlainRecord(newTargetObject)) {
				assignUnknownObjectFromDefaultObject(v, newTargetObject);
			} else {
				targetObject[k] = v;
			}
			return;
		}

		if (targetObject[k] === null || targetObject[k] === undefined) {
			targetObject[k] = v;
			return;
		}
	});
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
