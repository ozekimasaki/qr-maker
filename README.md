# QR Maker

ブラウザ上で動作する QR コードジェネレーターです。テキストや URL からリアルタイムに QR コードを生成し、色・形状・サイズ・誤り訂正レベル・中央ロゴなどをカスタマイズして、SVG / PNG / JPEG でダウンロードできます。

[qr-code-styling](https://www.npmjs.com/package/qr-code-styling) をベースに、Vite + TypeScript で構築されたシングルページアプリケーションです。ビルド成果物は Cloudflare Workers（静的アセット / SPA 配信）へデプロイできます。

## 主な機能

- テキスト / URL の入力に応じたリアルタイム QR コード生成
- ドット色・背景色の変更（カラーピッカー）
- ドット形状の選択: `square` / `rounded` / `dots`
- コーナー形状の選択: `square` / `dot` / `extra-rounded`
- 中央画像（ロゴ）の埋め込み（ローカルファイルを選択）
- ロゴサイズ（0.1〜0.6）とロゴ角丸（0〜50%）の調整
- 幅・高さ（128〜1024px）の調整とサイズリセット
- クワイエットゾーン（余白）の調整（0〜64px）
- 誤り訂正レベルの選択: `L` / `M` / `Q` / `H`
- SVG / PNG / JPEG でのダウンロード

## 要件

- Node.js 22 系（`.prototools` で `node = "~22"` を指定）

## インストール

```bash
npm install
```

> リポジトリには `package-lock.json` と `pnpm-lock.yaml` の両方が含まれています。npm を使う場合は `npm ci`、pnpm を使う場合は `pnpm install` を利用できます。

## 使い方

開発サーバーを起動します（`vite.config.ts` の設定により自動でブラウザが開きます）。

```bash
npm run dev
```

本番ビルドとプレビュー:

```bash
npm run build
npm run preview
```

ビルド成果物は `dist/` に出力されます。

## 開発コマンド

`package.json` の `scripts` に定義されているコマンドです。

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | Vite 開発サーバーを起動 |
| `npm run build` | 本番ビルド（`dist/` に出力） |
| `npm run preview` | ビルド成果物をローカルでプレビュー |
| `npm run cf:dev` | ビルド後に `wrangler dev` で Cloudflare 環境をローカル実行 |
| `npm run cf:deploy` | ビルド後に `wrangler deploy` で Cloudflare へデプロイ |
| `npm run cf:login` | `wrangler login` で Cloudflare 認証 |

型チェックは TypeScript コンパイラで行えます（`tsconfig.json` は `noEmit: true`）。

```bash
npx tsc --noEmit
```

## プロジェクト構成

```
.
├── index.html                     # エントリ HTML（UI マークアップ）
├── src/
│   ├── main.ts                    # アプリのエントリポイント（QR 生成・UI イベント処理）
│   ├── style.css                  # スタイル
│   └── types/
│       └── qr-code-styling.d.ts   # qr-code-styling の型定義
├── vite.config.ts                 # Vite 設定
├── tsconfig.json                  # TypeScript 設定
├── wrangler.toml                  # Cloudflare Workers 設定（dist を SPA として配信）
├── .prototools                    # proto によるツールバージョン指定（Node 22）
├── package.json
├── package-lock.json
└── pnpm-lock.yaml
```

## デプロイ

`wrangler.toml` で `dist/` を静的アセットとして配信し、`not_found_handling = "single-page-application"` で SPA として動作させます。

```bash
npm run cf:login   # 初回のみ
npm run cf:deploy
```

## ライセンス

このリポジトリにはライセンスファイルが含まれていません。`package.json` では `"private": true` が設定されています。
