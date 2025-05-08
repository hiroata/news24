// APIユーティリティ関数とエラー処理のための共通モジュール

/**
 * 指定ミリ秒だけ待機する Promise を返す
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * リトライ処理を実装した関数
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000,
  backoff: number = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    await delay(delayMs);
    return withRetry(fn, retries - 1, delayMs * backoff, backoff);
  }
}

/**
 * APIエラーレスポンスを標準化したエラークラス
 */
export class ApiError extends Error {
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
export async function fetchWithErrorHandling(
  url: string,
  options: RequestInit = {},
  retries = 3
): Promise<Response> {
  const response = await withRetry(async () => {
    const res = await fetch(url, options);
    
    // レート制限エラー (429) の場合は少し待機してからリトライ
    if (res.status === 429) {
      // レート制限に関するヘッダーがあれば待機時間を調整
      const retryAfter = res.headers.get('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
      await delay(waitTime);
      throw new ApiError(429, 'Too Many Requests', 'Rate limit exceeded, retrying after delay');
    }
    
    if (!res.ok) {
      throw await ApiError.fromResponse(res);
    }
    
    return res;
  }, retries);
  
  return response;
}

/**
 * エラーログ記録用の共通関数
 */
export function logError(error: any, context: string = ''): void {
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
export function getFriendlyErrorMessage(error: any): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400: return 'リクエストに問題があります。入力内容を確認してください。';
      case 401: return '認証が必要です。再度ログインしてください。';
      case 403: return 'アクセスが拒否されました。権限がない可能性があります。';
      case 404: return 'リクエストしたリソースが見つかりませんでした。';
      case 429: return 'リクエストが多すぎます。しばらく待ってから再試行してください。';
      case 500: return 'サーバーでエラーが発生しました。時間をおいて再度お試しください。';
      default: return 'エラーが発生しました。時間をおいて再度お試しください。';
    }
  }
  
  return 'エラーが発生しました。時間をおいて再度お試しください。';
}