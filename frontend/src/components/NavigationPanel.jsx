import React from 'react';

const NavigationPanel = ({ videos, currentVideoIndex, onVideoChange, annotationStatus }) => {
  return (
    <div>
      <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Video List</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {videos.map((video, idx) => {
          const isCurrent = idx === currentVideoIndex;
          const isFinished = annotationStatus[video] === 'finished';

          let backgroundColor = 'white';
          let border = '1px solid black';

          if (isFinished) {
            backgroundColor = 'green';
          }

          if (isCurrent) {
            border = '3px solid limegreen';  // 当前正在填写的，粗绿框
          }

          return (
            <div
              key={idx}
              onClick={() => onVideoChange(idx)}
              style={{
                width: '50px',
                height: '50px',
                margin: '5px',
                backgroundColor: backgroundColor,
                border: border,
                color: isFinished ? 'white' : 'black',
                textAlign: 'center',
                lineHeight: '50px',
                fontWeight: 'bold',
                cursor: 'pointer',
                userSelect: 'none',
                borderRadius: '5px',
              }}
            >
              {idx + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationPanel;
