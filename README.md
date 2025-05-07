# EroNews Generator

## セットアップ

1. 依存インストール
   ```sh
   npm install
   ```
2. .envファイルを作成し、APIキーを記入
   ```env
   XAI_API_KEY=xxx
   GEMINI_API_KEY=xxx
   OPENAI_API_KEY=xxx
   DEEPL_API_KEY=xxx
   ```
3. 開発サーバー起動
   ```sh
   npm run dev
   ```

## 自動生成スクリプト

- 小説自動生成: `npm run generate:novel`
- その他の自動生成・翻訳・音声生成は`src/lib/`配下のスクリプトを参照

## デプロイ

- Vercel連携でmainブランチpush時に自動デプロイ
- 本番環境のAPIキーはVercelの「Environment Variables」で設定
