import type { Config } from "@jest/types";

// Sync object
const config: Config.InitialOptions = {
	preset: "ts-jest",
	testEnvironment: "node",
	silent: true,
	moduleNameMapper: {
		"^@src(.*)$": "<rootDir>/src/$1",
	},
	moduleDirectories: ["node_modules", "src"],
	roots: ["<rootDir>/"],
	moduleFileExtensions: ["ts", "js"],
	transform: {
		"^.+\\.ts$": "ts-jest",
	},
	globals: {
		"ts-jest": {
			tsonfig: "tsconfig.json",
			isolatedModules: true,
		},
	},
};
export default config;
