import cspellRecommended from "@cspell/eslint-plugin/recommended";
import obsidianmd from "eslint-plugin-obsidianmd";

// Biome is the primary linter/formatter for this project (see biome.json).
// ESLint is kept minimal: only the official Obsidian plugin rules plus the
// cspell spell-checker, which Biome does not cover.
export default [
	{
		ignores: ["main.js", "coverage/", "release/"],
	},
	...obsidianmd.configs.recommended,
	{
		files: ["src/**/*.ts", "test/**/*.ts"],
		plugins: cspellRecommended.plugins,
		rules: {
			"@cspell/spellchecker": [
				"warn",
				{
					cspell: {
						language: "en",
						ignoreRegExpList: [
							// 日本語を無視
							"[０-９Ａ-Ｚａ-ｚぁ-んァ-ヶ亜-熙纊-黑]+",
							"keymap",
							"Prec",
						],
					},
				},
			],
		},
	},
];
