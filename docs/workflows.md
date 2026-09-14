# GitHub Actions ワークフロー

このディレクトリには `.github/workflows` 以下にある GitHub Actions ワークフローの設定内容をまとめる。

## claude.yml (Claude Code)

Issue や PR 上のコメントに `@claude` を含めることで Claude Code を起動するワークフロー。

### トリガー

- `issue_comment` (`created`) — Issue / PR のコメントが作成されたとき
- `pull_request_review_comment` (`created`) — PR のレビューコメントが作成されたとき
- `pull_request_review` (`submitted`) — PR レビューが送信されたとき
- `issues` (`opened`, `assigned`) — Issue が作成またはアサインされたとき

### 実行条件 (`if`)

以下のいずれかを満たす場合にのみ `claude` ジョブが実行される。

- Issue / PR コメントの本文に `@claude` が含まれる
- PR レビューコメントの本文に `@claude` が含まれる
- PR レビューの本文に `@claude` が含まれる
- Issue の本文またはタイトルに `@claude` が含まれる

### ジョブ: `claude`

- 実行環境: `ubuntu-latest`
- 権限:
  - `contents: read`
  - `pull-requests: read`
  - `issues: read`
  - `id-token: write`
  - `actions: read` (PR 上の CI 結果を Claude が参照できるようにするため)
- ステップ:
  1. `actions/checkout@v4` でリポジトリをチェックアウト（`fetch-depth: 1`）
  2. `anthropics/claude-code-action@v1` を実行し、`CLAUDE_CODE_OAUTH_TOKEN` シークレットで認証
     - `additional_permissions: actions: read` を付与し、PR 上の CI 結果を読み取れるようにしている
     - `prompt` や `claude_args` はコメントアウトされたオプション項目で、必要に応じてカスタムプロンプトや追加の CLI オプション（例: 許可するツールの指定）を設定できる

## claude-code-review.yml (Claude Code Review)

PR が作成・更新された際に自動でコードレビューを実行するワークフロー。

### トリガー

- `pull_request` (`opened`, `synchronize`, `ready_for_review`, `reopened`)
- 特定パスの変更時のみ実行する設定（`paths` フィルタ）はコメントアウトされており、デフォルトでは全ファイルが対象

### ジョブ: `claude-review`

- PR 作成者やコントリビューターの種類でジョブ実行を絞り込む `if` 条件はコメントアウトされており、デフォルトでは全ての PR に対して実行される
- 実行環境: `ubuntu-latest`
- 権限:
  - `contents: read`
  - `pull-requests: read`
  - `issues: read`
  - `id-token: write`
- ステップ:
  1. `actions/checkout@v4` でリポジトリをチェックアウト（`fetch-depth: 1`）
  2. `anthropics/claude-code-action@v1` を実行し、`CLAUDE_CODE_OAUTH_TOKEN` シークレットで認証
     - `plugin_marketplaces` / `plugins` で `code-review` プラグインを読み込む
     - `prompt` で `/code-review:code-review --comment` コマンドを実行し、対象 PR にインラインコメントでレビュー結果を投稿する
     - `claude_args` で `mcp__github_inline_comment__create_inline_comment` ツールの使用を許可している
