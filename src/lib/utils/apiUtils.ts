/**
 * API呼び出しに関するユーティリティ関数
 */

/**
 * 一定時間待機する関数
 * @param ms ミリ秒
 */
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * APIリクエスト失敗時のリトライ処理を行うラッパー関数
 * @param fn 実行する非同期関数
 * @param retries リトライ回数
 * @param retryDelay リトライ間の待機時間(ms)
 * @param backoff バックオフ倍率（待機時間を指数関数的に増加させるため）
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  retryDelay = 1000,
  backoff = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    console.log(`API呼び出しに失敗しました。${retryDelay}ms後にリトライします... (残り ${retries} 回)`);
    await delay(retryDelay);
    
    return withRetry(fn, retries - 1, retryDelay * backoff, backoff);
  }
}

/**
 * APIエラーレスポンスを標準化したエラークラス
 */
class ApiError extends Error {
  status: number;
  statusText: string;
  data?: any;
  
  constructor(status: number, statusText: string, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
  
  static async fromResponse(response: Response): Promise<ApiError> {
    let errorData: any = {};
    let errorMessage = response.statusText;
    
    try {
      errorData = await response.json();
      errorMessage = errorData.error || errorData.message || response.statusText;
    } catch (e) {
      // JSONとして解析できない場合はテキストで取得
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch (_) {
        // テキスト取得に失敗した場合は何もしない
      }
    }
    
    return new ApiError(
      response.status,
      response.statusText,
      errorMessage,
      errorData
    );
  }
}

/**
 * API呼び出しのためのラッパー関数
 * - エラーハンドリング
 * - リトライ
 * - レート制限対応
 */
async function fetchWithErrorHandling(
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(url, options);
    
    // レート制限エラーの場合は長めに待機してリトライ
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000;
      console.log(`レート制限に達しました。${waitTime}ms後にリトライします...`);
      await delay(waitTime);
      throw new ApiError(429, 'Too Many Requests', 'レート制限に達しました');
    }
    
    // 成功以外の場合はエラーを投げる
    if (!response.ok) {
      const apiError = await ApiError.fromResponse(response);
      throw apiError;
    }
    
    return response;
  }, retries);
}

/**
 * エラーログ記録用の共通関数
 */
function logError(error: any, context: string = ''): void {
  if (error instanceof ApiError) {
    console.error(`API Error (${context}): [${error.status}] ${error.message}`, error.data);
  } else {
    console.error(`Error (${context}):`, error);
  }
  
  // TODO: 将来的には外部のエラー監視サービスへの送信も実装
}

/**
 * ユーザーフレンドリーなエラーメッセージを返す
 */
function getFriendlyErrorMessage(error: any): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return '認証エラーが発生しました。再ログインしてください。';
      case 403:
        return '権限がありません。アクセス権を確認してください。';
      case 404:
        return '指定されたリソースが見つかりません。';
      case 429:
        return 'リクエスト制限に達しました。しばらく経ってから再試行してください。';
      case 500:
        return 'サーバーエラーが発生しました。時間をおいて再試行してください。';
      default:
        return `エラーが発生しました (${error.status}): ${error.message}`;
    }
  }
  
  return 'エラーが発生しました。時間をおいて再試行してください。';
}

module.exports = {
  delay,
  withRetry,
  ApiError,
  fetchWithErrorHandling,
  logError,
  getFriendlyErrorMessage
};