import React, { useState, useRef, useEffect } from "react";
import { PlayIcon, PauseIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';

type AudioPlayerProps = {
  src: string;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.75);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // オーディオの再生/一時停止を切り替える
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 再生位置を更新する
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setCurrentTime(audio.currentTime);
  };
  
  // メタデータのロード完了時に、オーディオの長さを取得する
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    setDuration(audio.duration);
  };
  
  // オーディオが終了したら、再生状態をリセットする
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };
  
  // プログレスバーの位置を変更してシーク
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const value = parseInt(e.target.value);
    audio.currentTime = value;
    setCurrentTime(value);
  };
  
  // 音量の変更
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const value = parseFloat(e.target.value);
    audio.volume = value;
    setVolume(value);
  };
  
  // 時間を mm:ss 形式に変換
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 shadow-sm">
      {/* 非表示のaudioエレメント */}
      <audio 
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      >
        お使いのブラウザはaudio要素に対応していません。
      </audio>
      
      {/* カスタムプレイヤーUI */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          {/* 再生/一時停止ボタン */}
          <button
            onClick={togglePlayPause}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 text-white transition-all"
            aria-label={isPlaying ? "一時停止" : "再生"}
          >
            {isPlaying ? (
              <PauseIcon className="h-5 w-5" />
            ) : (
              <PlayIcon className="h-5 w-5" />
            )}
          </button>
          
          {/* 時間表示 */}
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          {/* 音量コントロール */}
          <div className="flex items-center space-x-1">
            <SpeakerWaveIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 appearance-none bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden"
            />
          </div>
        </div>
        
        {/* プログレスバー */}
        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {/* プログレスインジケーター */}
          <div 
            className="absolute top-0 left-0 h-full bg-primary-500"
            style={{width: `${(currentTime / duration) * 100}%`}}
          />
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="absolute w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
