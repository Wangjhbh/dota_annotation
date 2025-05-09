import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ src, startTime = 0, endTime = null, autoLoop = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && startTime) {
      videoRef.current.currentTime = startTime;
    }
  }, [startTime, src]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (autoLoop) {
      if (endTime !== null) {
        if (video.currentTime >= endTime) {
          video.currentTime = startTime;
          video.play();
        }
      } else {
        if (video.currentTime >= video.duration) {
          video.currentTime = 0;
          video.play();
        }
      }
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        src={src}
        controls
        autoPlay
        muted
        onTimeUpdate={handleTimeUpdate}
        style={{ width: '100%', maxHeight: '400px', borderRadius: '10px' }}
      />
    </div>
  );
};

export default VideoPlayer;
