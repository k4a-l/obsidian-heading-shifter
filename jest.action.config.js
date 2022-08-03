/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

const common = require("./jest.config");

module.exports = {
	...common,
	collectCoverage: true,
};
