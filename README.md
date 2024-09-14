# Gitリポジトリドキュメント自動生成ツール

## 概要

このツールは、Google Geminiを用いてGitリポジトリの内容を要約し、開発者向けドキュメントを自動生成します。

## 特徴

- 環境変数の設定方法、APIエンドポイント、設定ファイル、コマンド実行例など、開発に必要な情報を自動的に抽出します。
- 初めてプロジェクトに触れる開発者でも理解しやすいように、具体例を交えて説明します。
- ファイルツリーを用いてリポジトリの構造を視覚化し、全体像を把握しやすくします。
- Markdown形式で出力するため、READMEファイルなどに簡単に組み込むことができます。

## 環境構築

### 前提条件

- Node.js
- npm
- Google Cloud Platformアカウント
- Google Gemini API キー

### 手順

1. リポジトリをクローンします。

```bash
git clone https://github.com/takoyaki-3/git-repo-summarizer.git
```

2. 依存関係をインストールします。

```bash
cd git-repo-summarizer
npm install
```

3. Google Gemini API キーを環境変数に設定します。

**Windows (PowerShell)**

```powershell
$env:GOOGLE_API_KEY = "YOUR_API_KEY"
```

**Unix系端末 (bash, zshなど)**

```bash
export GOOGLE_API_KEY="YOUR_API_KEY"
```

## 利用方法

### ドキュメント生成

以下のコマンドを実行して、ドキュメントを生成します。

```bash
npm run mkdoc -- -t /path/to/your/repo -o document.md
```

**オプション**

- `-t`, `--target`: 対象のリポジトリのパスを指定します。デフォルトはカレントディレクトリです。
- `-o`, `--output`: 出力ファイル名を指定します。デフォルトは `gemini-output-YYYYMMDD-HHMMSS.md` のようなタイムスタンプ付きのファイル名になります。
- `-m`, `--model_id`: 利用する Gemini のモデル ID を指定します。デフォルトは `gemini-1.5-pro` です。

**実行例**

```bash
npm run mkdoc -- -t ./my-project -o my-project-doc.md
```

### Gitリポジトリ情報のMarkdown形式出力

以下のコマンドを実行して、Gitリポジトリの情報をMarkdown形式で出力します。

```bash
npm run summarize -- -t /path/to/your/repo -o output.md
```

**オプション**

- `-t`, `--target`: 対象のリポジトリのパスを指定します。デフォルトはカレントディレクトリです。
- `-o`, `--output`: 出力ファイル名を指定します。デフォルトは `git-repo-summary-YYYYMMDD-HHMMSS.md` のようなタイムスタンプ付きのファイル名になります。

**実行例**

```bash
npm run summarize -- -t ./my-project -o my-project-summary.md
```

## ファイル構成

```
├── geminiRequest.mjs
├── geminiRequest.test.js
├── index.mjs
├── package.json
├── prompts
│   └── generage-document-prompt.md
├── toMarkdown.mjs
└── utils
    ├── generateFileName.mjs
    ├── generateFileName.test.js
    ├── summarize.mjs
    └── summarize.test.js
```

### ファイル説明

- **geminiRequest.mjs:** Google Gemini API へのリクエスト処理を行います。
  - `GEMINI_MODEL_ID` と `GEMINI_API_URL` は、利用する Gemini のモデルと API エンドポイントを定義します。
  - `systemPromptFile` は、ドキュメント生成の指示を記述した Markdown ファイルを指定します。
  - メイン処理では、システムプロンプトと Git リポジトリの内容を結合して Gemini API に送信し、その結果をファイルに書き込みます。
- **geminiRequest.test.js:** `geminiRequest.mjs` のテストコードです。
- **index.mjs:** `generateOutput` と `requestGemini` 関数をエクスポートします。
- **package.json:** プロジェクトの依存関係とスクリプトを定義します。
  - `scripts` セクションでは、以下のコマンドが定義されています。
    - `summarize`: `toMarkdown.mjs` を実行して、Git リポジトリの情報を Markdown 形式で出力します。
    - `mkdoc`: `geminiRequest.mjs` を実行して、Gemini API を用いてドキュメントを生成します。
    - `test`: テストを実行します。
- **prompts/generage-document-prompt.md:** ドキュメント生成の指示を記述した Markdown ファイルです。このファイルの内容が Gemini API に送信され、ドキュメントの生成に利用されます。
- **toMarkdown.mjs:** Git リポジトリの情報を Markdown 形式に変換します。
  - `generateOutput` 関数は、Git リポジトリのパスを受け取り、その内容を Markdown 形式の文字列として返します。
- **utils/generateFileName.mjs:** タイムスタンプ付きのファイル名を生成します。
- **utils/generateFileName.test.js:** `generateFileName.mjs` のテストコードです。
- **utils/summarize.mjs:** Git リポジトリの情報を収集し、Markdown 形式のレポートを生成します。
  - `isIgnored` 関数は、無視すべきファイルかどうかを判定します。
  - `createFileTree` 関数は、ファイルのリストからファイルツリーを作成します。
  - `formatTree` 関数は、ファイルツリーをフォーマットして文字列として返します。
  - `isTextFile` 関数は、ファイルがテキストファイルかどうかを判定します。
  - `generateOutput` 関数は、Git リポジトリの情報を収集し、Markdown 形式のレポートを生成します。
- **utils/summarize.test.js:** `summarize.mjs` のテストコードです。

## 補足

- Google Gemini API の利用料金については、Google Cloud Platform の料金ページをご確認ください。

## ライセンス

このプロジェクトは MIT ライセンスで公開されています。