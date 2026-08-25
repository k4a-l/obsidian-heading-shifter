/**
 * obsidian@1.13.x の公式型定義 (obsidian.d.ts) における不備を補完するための型宣言。
 *
 * Menu, Modal, PopoverSuggest は内部で HistoryHandler インターフェースを実装しているが、
 * 公式型定義側で必須メソッド onHistoryBack(): void の定義が欠落しているため、
 * TypeScript の型チェック (tsc -noEmit) を通すために宣言マージ (Declaration Merging) で補完する。
 */
import "obsidian";

declare module "obsidian" {
	interface Menu {
		onHistoryBack(): void;
	}
	interface Modal {
		onHistoryBack(): void;
	}
	interface PopoverSuggest<T> {
		onHistoryBack(arg?: T): void;
	}
}
