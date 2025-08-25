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

## 使い方

### 手動実行

```bash
# 業務開始通知
npm run dev start

# 業務終了通知
npm run dev end
```

### 祝日の設定

祝日に自動的に通知をスキップするため、内閣府の公式祝日データを使用します。

1. [内閣府の国民の祝日について](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html)のページにアクセス
2. ページ下部にある「昭和 30 年（1955 年）から令和 8 年（2026 年）国民の祝日（csv 形式：20KB）」のリンクをクリックして CSV ファイルをダウンロード
3. ダウンロードした CSV ファイルを `holidays/syukujitsu.csv` として保存

```bash
# 例：ダウンロードしたファイルを適切な場所に移動
mv ~/Downloads/syukujitsu.csv holidays/syukujitsu.csv
```

祝日データが正しく設定されていれば、祝日には自動的に通知がスキップされます。

### 自動実行（推奨）

cron ジョブを使用して、平日の業務開始・終了時に自動通知を送信できます。

#### 簡単セットアップ（推奨）

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
