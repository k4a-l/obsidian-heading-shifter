/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

import common from "./jest.config";

module.exports = {
	...common,
	collectCoverage: true,
};
