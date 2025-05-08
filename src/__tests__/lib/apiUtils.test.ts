import { getFriendlyErrorMessage, ApiError, withRetry, delay } from '../../../lib/utils/apiUtils';

// モックでのタイマー制御を使用
jest.useFakeTimers();

describe('apiUtils', () => {
  describe('getFriendlyErrorMessage', () => {
    test('異なるステータスコードに応じて適切なメッセージを返す', () => {
      const error401 = new ApiError(401, 'Unauthorized', 'Invalid token');
      const error404 = new ApiError(404, 'Not Found', 'Resource not found');
      const error500 = new ApiError(500, 'Internal Server Error', 'Server error');
      const unknownError = new Error('Unknown error');

      expect(getFriendlyErrorMessage(error401)).toBe('認証に失敗しました。再ログインしてください。');
      expect(getFriendlyErrorMessage(error404)).toBe('リクエストしたリソースが見つかりませんでした。');
      expect(getFriendlyErrorMessage(error500)).toBe('サーバーエラーが発生しました。しばらく時間をおいて再試行してください。');
      expect(getFriendlyErrorMessage(unknownError)).toBe('エラーが発生しました。時間をおいて再試行してください。');
    });
  });

  describe('withRetry', () => {
    test('成功した関数を実行したら結果を返す', async () => {
      const successFn = jest.fn().mockResolvedValue('success');
      const result = await withRetry(successFn, 3);
      
      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    test('失敗した関数は指定回数リトライする', async () => {
      const failFn = jest.fn()
        .mockRejectedValueOnce(new Error('失敗1'))
        .mockRejectedValueOnce(new Error('失敗2'))
        .mockResolvedValue('success');
      
      const result = await withRetry(failFn, 3, 1000);
      
      expect(result).toBe('success');
      expect(failFn).toHaveBeenCalledTimes(3);
    });

    test('すべてのリトライが失敗したらエラーを投げる', async () => {
      const failFn = jest.fn().mockRejectedValue(new Error('失敗'));
      
      await expect(withRetry(failFn, 2, 1000)).rejects.toThrow('失敗');
      expect(failFn).toHaveBeenCalledTimes(3); // 初回+2回のリトライ
    });
  });

  describe('delay', () => {
    test('指定したミリ秒待機する', async () => {
      const delayPromise = delay(1000);
      
      // タイマーを進める
      jest.advanceTimersByTime(1000);
      
      await expect(delayPromise).resolves.toBeUndefined();
    });
  });
});