import React from "react";

type AudioPlayerProps = {
  src: string;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => (
  <audio controls src={src} className="w-full mt-2">
    お使いのブラウザはaudio要素に対応していません。
  </audio>
);
