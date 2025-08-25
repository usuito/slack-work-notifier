# Slack Work CLI

業務開始・終了の通知を Slack に自動送信する CLI ツールです。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
npm run build
```

### 2. 環境変数の設定

`.env` ファイルを作成：

```bash
SLACK_TOKEN=xoxp-your-token-here
SLACK_CHANNEL=your-channel-id

# オプション: デフォルトメッセージをカスタマイズ
START_DEFAULT_MESSAGE=業務開始
END_DEFAULT_MESSAGE=業務終了
```

## 使い方

### 手動実行

```bash
# 業務開始通知
npm run dev start

# 業務終了通知
npm run dev end
```

### 自動実行（推奨）

cron 等を利用して設定してください。
