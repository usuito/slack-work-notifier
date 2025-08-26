# Slack Work Notifier

業務開始・終了の通知を Slack に自動送信する CLI ツールです。
ランダムなスリープ機能により、定時ピッタリではなく数分程度の幅を持たせて送信するため、自動送信がバレにくくなっています。

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

### 3. 祝日の設定

祝日に自動的に通知をスキップするため、内閣府の公式祝日データを使用します。

1. [内閣府の国民の祝日について](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html)のページにアクセス
2. ページ下部にある「昭和 30 年（1955 年）から令和 8 年（2026 年）国民の祝日（csv 形式：20KB）」のリンクをクリックして CSV ファイルをダウンロード
3. ダウンロードした CSV ファイルを `holidays/syukujitsu.csv` として保存

```bash
# 例：ダウンロードしたファイルを適切な場所に移動
mv ~/Downloads/syukujitsu.csv holidays/syukujitsu.csv
```

祝日データが正しく設定されていれば、祝日には自動的に通知がスキップされます。

## 使い方

### 手動実行

```bash
# 業務開始通知
npm run dev start

# 業務終了通知
npm run dev end
```

### 自動実行（推奨）

平日の業務開始・終了時に自動通知を送信する方法は 2 つあります：

- **cron**: 従来の Unix スケジューラー
- **launchd**: macOS ネイティブのスケジューラー（**推奨**）

#### 💡 どちらを選ぶべき？

**launchd（推奨）**:

- ✅ **スリープ復帰対応**: Mac がスリープから復帰した後も正常に動作
- ✅ **電源管理最適化**: macOS の電源管理機能と協調動作
- ✅ **自動復旧**: プロセスが異常終了した場合の自動再起動
- ✅ **システム統合**: macOS にネイティブ統合

**cron**:

- ❌ スリープ中は動作しない
- ✅ Unix/Linux 系 OS で汎用的に利用可能

## launchd を使用（macOS 推奨）

### 簡単セットアップ（推奨）

```bash
# launchdディレクトリに移動
cd launchd

# スクリプトを実行可能にする
chmod +x setup-launchd.sh remove-launchd.sh

# 自動セットアップを実行
./setup-launchd.sh
```

これで以下のスケジュールで自動通知が設定されます：

- **業務開始**: 月曜日〜金曜日の午前 9:00（ランダム 1〜5 分遅延）
- **業務終了**: 月曜日〜金曜日の午後 6:00（ランダム 1〜5 分遅延）

### launchd の管理

```bash
# エージェントの状態確認
launchctl list | grep slack-work-notifier

# ログファイルの確認
tail -f logs/start.log
tail -f logs/end.log

# launchd 設定を削除（自動削除スクリプト使用）
cd launchd && ./remove-launchd.sh
```

詳細な設定方法やトラブルシューティングは `launchd/LAUNCHD_SETUP.md` を参照してください。

## cron を使用

### 簡単セットアップ

```bash
# cronディレクトリに移動
cd cron

# スクリプトを実行可能にする
chmod +x setup-cron.sh remove-cron.sh

# 自動セットアップを実行
./setup-cron.sh
```

これで以下のスケジュールで自動通知が設定されます：

- **業務開始**: 月曜日〜金曜日の午前 9:00（ランダム 1〜5 分遅延）
- **業務終了**: 月曜日〜金曜日の午後 6:00（ランダム 1〜5 分遅延）

#### 手動セットアップ

1. プロジェクトをビルド：

   ```bash
   npm run build
   ```

2. crontab を編集：

   ```bash
   crontab -e
   ```

3. 以下を追加（プロジェクトパスを実際のパスに変更）：

   ```cron
   # PATH設定
   PATH=/usr/local/bin:/usr/bin:/bin:$(dirname $(which node))

   # 業務開始・終了通知
   0 9 * * 1-5 cd /path/to/your/project && node dist/index.js start
   0 18 * * 1-5 cd /path/to/your/project && node dist/index.js end
   ```

#### cron ジョブの管理

```bash
# 現在の設定を確認
crontab -l

# cron ジョブを削除（自動削除スクリプト使用）
cd cron && ./remove-cron.sh

# または手動で削除
crontab -e  # エディタで該当行を削除
```

詳細な設定方法やトラブルシューティングは `cron/CRON_SETUP.md` を参照してください。

## テスト・ステータス確認

```bash
# 接続テスト
npm run dev status

# 業務開始通知のテスト
npm run dev start

# 業務終了通知のテスト
npm run dev end
```

## ファイル構成

```
slack-work-notifier/
├── src/                    # TypeScript ソースコード
├── dist/                   # ビルド済み JavaScript
├── holidays/               # 祝日データ
├── logs/                   # ログファイル（launchd 使用時）
├── cron/                   # cron 設定関連
│   ├── setup-cron.sh      # cron 自動セットアップ
│   ├── remove-cron.sh     # cron 削除
│   └── CRON_SETUP.md      # cron 詳細ガイド
├── launchd/                # launchd 設定関連（macOS 推奨）
│   ├── setup-launchd.sh   # launchd 自動セットアップ
│   ├── remove-launchd.sh  # launchd 削除
│   └── LAUNCHD_SETUP.md   # launchd 詳細ガイド
└── .env                    # 環境変数設定
```
