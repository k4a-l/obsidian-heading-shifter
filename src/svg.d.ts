declare module "*.svg" {
	/** Inner markup of the SVG's root element (no surrounding `<svg>` tag),
	 * as required by Obsidian's `addIcon`. Produced by the esbuild svg-icon plugin. */
	const content: string;
	export default content;
}
