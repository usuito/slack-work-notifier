# 🚀 launchd Setup for Slack Work Notifier

この設定により、cron よりも信頼性の高い macOS ネイティブの launchd を使用して Slack 通知を自動化できます。

## ✨ launchd の利点

- **スリープ復帰対応**: Mac がスリープから復帰した後も正常にスケジュール実行
- **電源管理最適化**: macOS の電源管理機能と協調動作
- **自動復旧**: プロセスが異常終了した場合の自動再起動
- **システム統合**: macOS にネイティブ統合されたスケジューリング

## 📁 ファイル構成

```
launchd/
├── setup-launchd.sh                              # 自動セットアップスクリプト
├── remove-launchd.sh                             # アンインストールスクリプト
├── com.usuito.slack-work-notifier.start.plist    # 仕事開始通知用設定
├── com.usuito.slack-work-notifier.end.plist      # 仕事終了通知用設定
└── LAUNCHD_SETUP.md                             # このファイル
```

## 🔧 セットアップ手順

### 1. 自動セットアップ（推奨）

```bash
# プロジェクトルートから実行
cd /path/to/slack-work-notifier
./launchd/setup-launchd.sh
```

このスクリプトは以下を自動実行します：

- Node.js と npm の存在確認
- TypeScript プロジェクトのビルド
- ログディレクトリの作成
- plist ファイルの設定とインストール
- launchd エージェントの読み込み

### 2. 手動セットアップ（上級者向け）

1. **プロジェクトをビルド**

   ```bash
   npm run build
   ```

2. **ログディレクトリを作成**

   ```bash
   mkdir -p logs
   ```

3. **plist ファイルを編集**

   - `PROJECT_PATH` を実際のプロジェクトパスに置換
   - Node.js のパスを確認・更新

4. **LaunchAgents にコピー**

   ```bash
   cp launchd/*.plist ~/Library/LaunchAgents/
   ```

5. **エージェントを読み込み**
   ```bash
   launchctl load ~/Library/LaunchAgents/com.usuito.slack-work-notifier.start.plist
   launchctl load ~/Library/LaunchAgents/com.usuito.slack-work-notifier.end.plist
   ```

## 📅 実行スケジュール

- **仕事開始通知**: 月曜日〜金曜日 午前 9:00
- **仕事終了通知**: 月曜日〜金曜日 午後 6:00

## 📊 ステータス確認

### エージェントの状態確認

```bash
launchctl list | grep slack-work-notifier
```

### ログファイルの確認

```bash
# 仕事開始通知のログ
tail -f logs/start.log
tail -f logs/start.error.log

# 仕事終了通知のログ
tail -f logs/end.log
tail -f logs/end.error.log
```

### 手動実行でのテスト

```bash
# 仕事開始通知をテスト
npm run start start

# 仕事終了通知をテスト
npm run start end

# 接続状態とホリデーチェック
npm run start status
```

## 🗑️ アンインストール

### 自動アンインストール

```bash
./launchd/remove-launchd.sh
```

### 手動アンインストール

```bash
# エージェントのアンロード
launchctl unload ~/Library/LaunchAgents/com.usuito.slack-work-notifier.start.plist
launchctl unload ~/Library/LaunchAgents/com.usuito.slack-work-notifier.end.plist

# plistファイルの削除
rm ~/Library/LaunchAgents/com.usuito.slack-work-notifier.*.plist
```

## 🔧 トラブルシューティング

### エラーが発生した場合

1. **ログファイルを確認**

   ```bash
   cat logs/start.error.log
   cat logs/end.error.log
   ```

2. **権限の確認**

   ```bash
   ls -la ~/Library/LaunchAgents/com.usuito.slack-work-notifier.*
   ```

3. **Node.js のパス確認**

   ```bash
   which node
   ```

4. **プロジェクトのビルド状態確認**
   ```bash
   ls -la dist/
   npm run build
   ```

### よくある問題

- **Permission denied**: スクリプトに実行権限がない

  ```bash
  chmod +x launchd/*.sh
  ```

- **Node.js not found**: plist ファイル内の Node.js パスが間違っている
- **.env 設定**: 環境変数ファイルが正しく設定されていない

## 💡 追加設定

### 異なる実行時間に変更したい場合

plist ファイル内の `Hour` と `Minute` の値を変更：

```xml
<key>Hour</key>
<integer>10</integer>  <!-- 10時に変更 -->
<key>Minute</key>
<integer>30</integer>  <!-- 30分に変更 -->
```

変更後はエージェントを再読み込み：

```bash
launchctl unload ~/Library/LaunchAgents/com.usuito.slack-work-notifier.start.plist
launchctl load ~/Library/LaunchAgents/com.usuito.slack-work-notifier.start.plist
```

### スリープからの復帰時実行

launchd は自動的にスリープ復帰時の実行に対応しますが、より確実にしたい場合は `RunAtLoad` を `true` に設定することもできます。

## ⚠️ 注意事項

- macOS の再起動後も自動的に有効になります
- cron と併用する場合は重複実行に注意してください
- システムの時刻設定が正確であることを確認してください
