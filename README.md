## このリポジトリについて

このGitリポジトリは、Google Geminiを用いてGitリポジトリの内容を要約し、開発者向けドキュメントを自動生成するためのツールを提供します。

## 環境変数の設定

このツールは、Google Gemini APIとの通信にAPIキーを使用します。APIキーは環境変数 `GOOGLE_API_KEY` に設定する必要があります。

### Windows (PowerShell)

```powershell
$env:GOOGLE_API_KEY = "YOUR_API_KEY"
```

**注意:** 環境変数は、PowerShellを再起動すると失われます。永続的に設定する場合は、システムのプロパティから環境変数を設定してください。

### Unix系端末 (bash, zshなど)

```bash
export GOOGLE_API_KEY="YOUR_API_KEY"
```

**注意:** 環境変数は、現在の端末セッションでのみ有効です。永続的に設定する場合は、シェル設定ファイル（.bashrc, .zshrcなど）に上記のコマンドを追加してください。

## ファイルツリー

```
├── geminiRequest.js
├── index.js
├── package.json
├── prompts
│   └── generage-document-prompt.md
├── toMarkdown.js
└── utils
    ├── generateFileName.js
    └── summarize.js

```

### ファイルの説明

- **geminiRequest.js:** Google Gemini APIへのリクエスト処理を行います。
    - `GEMINI_MODEL_ID` と `GEMINI_API_URL` は、利用するGeminiのモデルとAPIエンドポイントを定義します。
    - `systemPromptFile` は、ドキュメント生成の指示を記述したMarkdownファイルを指定します。
    - メイン処理では、システムプロンプトとGitリポジトリの内容を結合してGemini APIに送信し、その結果をファイルに書き込みます。
- **index.js:**  `generateOutput` と `requestGemini` 関数をエクスポートします。
- **package.json:** プロジェクトの依存関係とスクリプトを定義します。
    - `scripts` セクションでは、以下のコマンドが定義されています。
        - `summarize`: `toMarkdown.js` を実行して、Gitリポジトリの情報をMarkdown形式で出力します。
        - `mkdoc`: `geminiRequest.js` を実行して、Gemini APIを用いてドキュメントを生成します。
- **prompts/generage-document-prompt.md:** ドキュメント生成の指示を記述したMarkdownファイルです。このファイルの内容がGemini APIに送信され、ドキュメントの生成に利用されます。
- **toMarkdown.js:** Gitリポジトリの情報をMarkdown形式に変換します。
    - `generateOutput` 関数は、Gitリポジトリのパスを受け取り、その内容をMarkdown形式の文字列として返します。
- **utils/generateFileName.js:** タイムスタンプ付きのファイル名を生成します。
- **utils/summarize.js:** Gitリポジトリの情報を収集し、Markdown形式のレポートを生成します。
    - `isIgnored` 関数は、無視すべきファイルかどうかを判定します。
    - `createFileTree` 関数は、ファイルのリストからファイルツリーを作成します。
    - `formatTree` 関数は、ファイルツリーをフォーマットして文字列として返します。
    - `isTextFile` 関数は、ファイルがテキストファイルかどうかを判定します。
    - `generateOutput` 関数は、Gitリポジトリの情報を収集し、Markdown形式のレポートを生成します。

## コマンド実行例

### Gitリポジトリの情報をMarkdown形式で出力

```bash
npm run summarize -- -t /path/to/your/repo -o output.md
```

**オプション:**

- `-t`, `--target`: 対象のGitリポジトリのパスを指定します。デフォルトはカレントディレクトリです。
- `-o`, `--output`: 出力ファイル名を指定します。デフォルトは `git-repo-summary-YYYYMMDD-HHMMSS.md` のようなタイムスタンプ付きのファイル名になります。

**出力例:**

`output.md` というファイルに、Gitリポジトリの情報がMarkdown形式で出力されます。

### Gemini APIを用いてドキュメントを生成

```bash
npm run mkdoc -- -m gemini-pro -t /path/to/your/repo -o document.md
```

**オプション:**

- `-m`, `--model_id`: 利用するGeminiのモデルIDを指定します。デフォルトは `gemini-1.5-pro` です。
- `-t`, `--target`: 対象のGitリポジトリのパスを指定します。
- `-o`, `--output`: 出力ファイル名を指定します。デフォルトは `gemini-output-YYYYMMDD-HHMMSS.md` のようなタイムスタンプ付きのファイル名になります。

**出力例:**

`document.md` というファイルに、Gemini APIを用いて生成されたドキュメントが出力されます。


## 補足

- このツールは、Node.jsとnpmが必要です。
- Google Gemini APIを利用するには、Google Cloud PlatformのアカウントとAPIキーが必要です。