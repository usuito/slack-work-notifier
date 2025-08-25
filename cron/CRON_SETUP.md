# Slack Work Notifier - Cron 自動実行設定ガイド

このガイドでは、cron ジョブを使用して Slack への業務開始・終了通知を自動化する方法を説明します。

## 📋 実行スケジュール

cron ジョブは以下のタイミングで通知を送信します：

- **業務開始**: 月曜日〜金曜日の午前 9:00 + ランダム遅延（1〜5 分）
- **業務終了**: 月曜日〜金曜日の午後 6:00 + ランダム遅延（1〜5 分）

**デフォルトメッセージ:**

- 業務開始: "業務開始"
- 業務終了: "業務終了"

**ランダム遅延機能:**
すべての通知は 1〜5 分のランダムな遅延を持って送信され、定時ピッタリでの送信を避けることで自動送信がバレにくくなっています。

祝日は自動的に検知され、通知はスキップされます。

## 🚀 簡単セットアップ

### 方法 1: 自動セットアップ（推奨）

```bash
# スクリプトを実行可能にする
chmod +x setup-cron.sh remove-cron.sh

# セットアップスクリプトを実行
./setup-cron.sh
```

### 方法 2: 手動セットアップ

1. プロジェクトをビルド：

   ```bash
   npm run build
   ```

2. crontab を編集：

   ```bash
   crontab -e
   ```

3. 以下の行を追加（`crontab`ファイルからコピー）：

   ```cron
   # npmとnodeが見つかるようにPATHを設定（your-node-pathは実際のNode.jsパスに変更）
   PATH=/usr/local/bin:/usr/bin:/bin:$(dirname $(which node))

   # 業務開始通知 - 月曜日〜金曜日の午前9時
   0 9 * * 1-5 cd /path/to/your/project && node dist/index.js start

   # 業務終了通知 - 月曜日〜金曜日の午後6時
   0 18 * * 1-5 cd /path/to/your/project && node dist/index.js end
   ```

4. 保存してエディタを終了。

## 🔧 管理・操作

### 現在の crontab を確認

```bash
crontab -l
```

### cron ジョブを削除

```bash
# スクリプトを使用（推奨）
./remove-cron.sh

# または手動で
crontab -e  # 手動でエントリを削除
```

## 🧪 テスト方法

### 手動実行テスト

```bash
# まずビルドする
npm run build

# 業務開始コマンドをテスト（ランダム遅延あり）
node dist/index.js start

# 業務終了コマンドをテスト（ランダム遅延あり）
node dist/index.js end

# 接続状態と祝日情報を確認
node dist/index.js status

# カスタムメッセージでテスト
node dist/index.js start -m "テストメッセージ"
```

### cron ジョブのテスト（待機なし）

時間を一時的に変更してテストできます：

1. crontab を編集：`crontab -e`
2. 実行時間を現在から数分後に変更
3. 待機して動作を確認（ランダム遅延のため最大 5 分程度待機）
4. 元の時間に戻す

**注意**: ランダム遅延機能により、1〜5 分の遅延があります。

## 📂 作成されるファイル

- `crontab` - crontab 設定ファイル
- `setup-cron.sh` - 自動セットアップスクリプト
- `remove-cron.sh` - 自動削除スクリプト
- `CRON_SETUP.md` - このドキュメント
- `crontab.backup` - 以前の crontab のバックアップ（スクリプト使用時）

## ⚠️ 重要な注意事項

1. **タイムゾーン**: cron ジョブは JST（日本標準時）に設定されています。システムが正しいタイムゾーンに設定されていることを確認してください。

2. **ビルド要件**: コードを変更した後は必ず `npm run build` を実行して、`dist/index.js` ファイルを更新してください。

3. **環境変数**: cron ジョブが正しく動作するためには、`.env` ファイルがプロジェクトルートディレクトリに存在する必要があります。

4. **祝日検知**: システムは `holidays/syukujitsu.csv` を自動的に読み込み、日本の祝日に通知をスキップします。

5. **パス設定**: setup-cron.sh を使用する場合、プロジェクトパスは自動的に検出されます。手動設定の場合は、crontab ファイル内の `/path/to/your/project` を実際のプロジェクトパスに変更してください。

6. **ランダム遅延**: すべての通知は 1〜5 分のランダムな遅延を持つため、設定時間から最大 5 分遅れて送信される可能性があります。

## 🔍 トラブルシューティング

### 通知が送信されない場合

1. **環境設定確認**: `.env` ファイルが存在し、SLACK_TOKEN と SLACK_CHANNEL が正しく設定されているか確認
2. **ビルド確認**: `npm run build` で最新のコードがビルドされているか確認
3. **接続テスト**: `node dist/index.js status` で Slack 接続と祝日情報を確認
4. **手動実行テスト**: `node dist/index.js start` で手動送信テスト
5. **祝日確認**: 今日が祝日でないか確認（祝日は自動的にスキップ）
6. **タイミング**: ランダム遅延のため、設定時刻から最大 5 分待つ

### 権限の問題

```bash
chmod +x setup-cron.sh remove-cron.sh
```

### パスの問題

「command not found」エラーが発生する場合：

1. **Node.js パス確認**:

   ```bash
   which node
   which npm
   ```

2. **setup-cron.sh 使用時**: パスは自動的に設定されます

3. **手動設定時**: crontab ファイル内の PATH 設定を確認し、必要に応じて更新してください。

4. **プロジェクトパス**: `/path/to/your/project` を実際のプロジェクトディレクトリパスに変更してください。
