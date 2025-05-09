# News24 - テックニュースアグリゲーター

海外のテクノロジーニュースサイトから最新の情報を収集し、日本語に翻訳して提供するニュースアグリゲーションサイトです。

## 主な機能

- 海外テックメディアからの自動記事収集
- Grok APIによる高品質な翻訳
- カテゴリ別記事表示
- タグベースの記事検索
- 多言語対応（日本語/英語）

## セットアップ

1. 依存インストール
   ```sh
   npm install
   ```
2. .envファイルを作成し、APIキーを記入
   ```env
   XAI_API_KEY=xxx
   DEEPL_API_KEY=xxx
   ```
3. 開発サーバー起動
   ```sh
   npm run dev
   ```

## ニュース取得スクリプト

- ニュース取得: `npm run fetch:news`
- GitHub Actionsにより6時間ごとに自動的にニュースを収集

## デプロイ

- Vercel連携でmainブランチpush時に自動デプロイ
- 本番環境のAPIキーはVercelの「Environment Variables」で設定

## 注意: APIキー・環境変数の管理

- `.env`ファイルは必ずgit管理外（.gitignore）にしてください。
- 本番環境ではVercelやGitHub Actionsの「Environment Variables」機能でAPIキーを安全に管理してください。
- APIキーやシークレット情報は絶対にリポジトリにコミットしないでください。
