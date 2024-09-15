# Gitリポジトリドキュメント自動生成ツール

## 概要

このツールは、Google Geminiを用いてGitリポジトリの内容を要約し、開発者向けドキュメントを自動生成します。

## 特徴

- 環境変数の設定方法、APIエンドポイント、設定ファイル、コマンド実行例など、開発に必要な情報を自動的に抽出します。
- 初めてプロジェクトに触れる開発者でも理解しやすいように、具体例を交えて説明します。
- ファイルツリーを用いてリポジトリの構造を視覚化し、全体像を把握しやすくします。
- Markdown形式で出力するため、READMEファイルなどに簡単に組み込むことができます。

-------------------

## グローバルインストールによる利用方法

このツールは、グローバルにインストールすることで、どのディレクトリからでもコマンドを使用できるようになります。

### 手順

1. プロジェクトをグローバルインストールします。

```bash
npm install -g
```

これにより、`git-repo-summarizer` コマンドがグローバルに登録されます。

### 確認

グローバルインストールが成功したかを確認するには、以下のコマンドを実行してバージョンを確認します。

```bash
git-repo-summarizer --version
```

バージョンが表示されれば、インストールは成功です。


グローバルにインストールした後、以下のようにプロジェクトのコマンドをどのディレクトリからでも実行できます。

### ドキュメント生成

以下のコマンドを実行して、ドキュメントを生成します。

**オプション**

```bash
git-repo-summarizer mkdoc -- -t /path/to/your/repo -o document.md
```

- `-t`, `--target`: 対象のリポジトリのパスを指定します。デフォルトはカレントディレクトリです。
- `-o`, `--output`: 出力ファイル名を指定します。デフォルトは `gemini-output-YYYYMMDD-HHMMSS.md` のようなタイムスタンプ付きのファイル名になります。
- `-m`, `--model_id`: 利用する Gemini のモデル ID を指定します。デフォルトは `gemini-1.5-pro` です。
- `-k`, `--api_key`: Google Gemini API の API キーを指定します。環境変数 `GOOGLE_API_KEY` より優先されます。

**実行例**

```bash
npm run mkdoc -- -t ./my-project -o my-project-doc.md
```

### Gitリポジトリ情報のMarkdown形式出力

以下のコマンドを実行して、Gitリポジトリの情報をMarkdown形式で出力します。

```bash
git-repo-summarizer summarize -- -t /path/to/your/repo -o output.md
```

**オプション**

- `-t`, `--target`: 対象のリポジトリのパスを指定します。デフォルトはカレントディレクトリです。
- `-o`, `--output`: 出力ファイル名を指定します。デフォルトは `git-repo-summary-YYYYMMDD-HHMMSS.md` のようなタイムスタンプ付きのファイル名になります。

**実行例**

```bash
npm run summarize -- -t ./my-project -o my-project-summary.md
```

### READMEの自動更新

以下のコマンドを実行して、READMEを自動更新します。

```bash
git-repo-summarizer readme -- -i /path/to/your/readme -o updated-readme.md
```

**オプション**

- `-i`, `--input`: 更新対象のREADMEファイルのパスを指定します。
- `-o`, `--output`: 出力ファイル名を指定します。デフォルトは `updated-readme-YYYYMMDD-HHMMSS.md` のようなタイムスタンプ付きのファイル名になります。
- `-t`, `--target`: 対象のGitリポジトリのパスを指定します。デフォルトはカレントディレクトリです。
- `-m`, `--model_id`: 利用する Gemini のモデル ID を指定します。デフォルトは `gemini-1.5-pro` です。
- `-k`, `--api_key`: Google Gemini API の API キーを指定します。環境変数 `GOOGLE_API_KEY` より優先されます。

### Geminiへテキストを投げる

```bash
git-repo-summarizer gemini -- -i /path/to/your/inputfile -t "要約してください" -o output.md
```

**実行例**

```bash
npm run readme -- -t ./my-project -o my-project-readme.md
```

--------------------

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

## ファイル構成

```
├── commands
│   ├── mkdoc.mjs
│   ├── readme.mjs
│   └── summarize.mjs
├── index.mjs
├── package.json
├── prompts
│   ├── generage-document-prompt.md
│   └── update-readme-prompt.md
└── utils
    ├── apiUtils.mjs
    ├── apiUtils.test.js
    ├── fileUtils.mjs
    ├── generateFileName.mjs
    ├── generateFileName.test.js
    ├── gitUtils.mjs
    └── summarize.mjs
```

### ファイル説明

- **.babelrc**: Babelの設定ファイルです。
- **commands**: コマンドラインツールのコマンドを定義したファイル群です。
  - **mkdoc.mjs**: `npm run mkdoc` コマンドの実装です。Gemini API を用いてドキュメントを生成します。
  - **readme.mjs**: `npm run readme` コマンドの実装です。README の自動更新を行います。
  - **summarize.mjs**: `npm run summarize` コマンドの実装です。Git リポジトリの情報を Markdown 形式で出力します。
- **index.mjs**: ツールのエントリーポイントです。コマンドライン引数を解析し、適切な処理を実行します。
- **package.json**: プロジェクトの依存関係とスクリプトを定義します。
- **prompts**: Gemini に渡すプロンプトを定義したファイル群です。
  - **generage-document-prompt.md**: ドキュメント生成の指示を記述した Markdown ファイルです。
  - **update-readme-prompt.md**: README の自動更新の指示を記述した Markdown ファイルです。
- **utils**: ユーティリティ関数を定義したファイル群です。
  - **apiUtils.mjs**: Google Gemini API へのリクエスト処理を行います。
  - **apiUtils.test.js**: apiUtils.mjs のユニットテストです。
  - **fileUtils.mjs**: ファイルの読み書きなどを行います。
  - **generateFileName.mjs**: タイムスタンプ付きのファイル名を生成します。
  - **generateFileName.test.js**: generateFileName.mjs のユニットテストです。
  - **gitUtils.mjs**: Git リポジトリの情報取得を行います。
  - **summarize.mjs**: Git リポジトリの情報を Markdown 形式にまとめます。

## 補足

- Google Gemini API の利用料金については、Google Cloud Platform の料金ページをご確認ください。

## ライセンス

このプロジェクトは MIT ライセンスで公開されています。