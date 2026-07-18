# AGENTS.md

このリポジトリでコーディングエージェントが作業する際のガイドです。

## プロジェクト概要

ブラウザ上で動作する QR コードジェネレーター（Vite + TypeScript のシングルページアプリ）。[qr-code-styling](https://www.npmjs.com/package/qr-code-styling) を用いて QR コードを生成し、SVG / PNG / JPEG でダウンロードできます。ビルド成果物は Cloudflare Workers へデプロイします。

## プロジェクト構成 / エントリポイント

- `index.html` — ルート HTML。UI（入力フォーム・プレビュー・ダウンロードボタン）を定義。`<script type="module" src="/src/main.ts">` を読み込む。
- `src/main.ts` — アプリのエントリポイント。`DOMContentLoaded` 後に DOM 要素を取得し、`QRCodeStyling` インスタンスを生成、各入力の `input` / `change` イベントで `qrCode.update(...)` を呼んで再描画する。ロゴ角丸は `applyExtension` / `deleteExtension` による SVG 拡張で実装。
- `src/style.css` — スタイル。
- `src/types/qr-code-styling.d.ts` — `qr-code-styling` のローカル型定義（`declare module 'qr-code-styling'`）。ライブラリの API を拡張・利用する際はここを更新する。
- `vite.config.ts` — Vite 設定（`server.open: true`）。
- `tsconfig.json` — TypeScript 設定（`strict: true`, `noEmit: true`, `moduleResolution: "Bundler"`）。
- `wrangler.toml` — Cloudflare Workers 設定。`dist/` を静的アセットとして SPA 配信。

## セットアップ

```bash
npm install   # または npm ci（package-lock.json あり）
```

- Node.js 22 系を使用（`.prototools`: `node = "~22"`）。
- ロックファイルは `package-lock.json` と `pnpm-lock.yaml` の両方が存在する。既存のロックファイルと整合するパッケージマネージャを使うこと。

## ビルド / テスト / lint / typecheck コマンド

`package.json` に定義された実在のスクリプトのみ:

- ビルド: `npm run build`（`dist/` に出力）
- 開発サーバー: `npm run dev`
- プレビュー: `npm run preview`
- Cloudflare ローカル実行: `npm run cf:dev`
- Cloudflare デプロイ: `npm run cf:deploy`
- Cloudflare ログイン: `npm run cf:login`
- 型チェック: `npx tsc --noEmit`（`tsconfig.json` は `noEmit: true`）

補足: テストランナー・lint ツール（ESLint / Prettier 等）はこのリポジトリに設定されていない。存在しないコマンドを実行・記載しないこと。変更後は最低限 `npx tsc --noEmit` と `npm run build` が通ることを確認する。

## コーディング規約

- 言語は TypeScript（`type: "module"` の ESM）。`strict` モードを維持し、型エラーを残さない。
- インデントは半角スペース 2、セミコロンなし、シングルクォート（`src/main.ts` の既存スタイルに合わせる）。
- DOM 取得は `document.getElementById(...) as HTMLXxxElement | null` とし、`?.` によるオプショナルチェーンで null を安全に扱う既存パターンを踏襲する。
- コメントは日本語で簡潔に（既存コードに合わせる）。
- ライブラリの型が不足する箇所では `src/types/qr-code-styling.d.ts` を優先して更新し、`as any` の多用は避ける（既存コードには一部 `as any` があるが、可能な限り型定義で解決する）。

## 注意点

- `QRCodeStyling` は `element` オプション未対応の場合に備え、`qrCode.append?.(canvasEl)` によるフォールバックを行っている。描画ロジックを変更する際は重複描画に注意。
- 入力値変更のたびに `reapplyExtension()` を呼び、ロゴ角丸（clipPath）を再適用している。QR 更新処理を追加する場合は同様に再適用の要否を確認する。
- 中央画像は `URL.createObjectURL` で参照し、`lastObjectUrl` を `revokeObjectURL` で解放している。メモリリークに注意。
- UI 要素を追加・変更する場合は、`index.html` の `id` と `src/main.ts` の取得コードを揃えること。
- 変更は必要最小限に留め、既存の構成・スタイルを尊重する。
