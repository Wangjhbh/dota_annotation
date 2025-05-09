import React, { useEffect, useState } from 'react';
import VideoPlayer from './VideoPlayer';
import AnnotationForm from './AnnotationForm';
import NavigationPanel from './NavigationPanel';
import axios from 'axios';

// 视频文件基础路径
const DATA_DIR = '/api/videos/';

const App = () => {
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [annotationData, setAnnotationData] = useState({});
  const [allAnnotations, setAllAnnotations] = useState([]); // 💥 新增：保存所有视频注释数据
  const [step, setStep] = useState('background'); // background -> abnormal_event -> abnormal_object

  useEffect(() => {
    fetchVideosAndAnnotations();
  }, []);

  const fetchVideosAndAnnotations = async () => {
    try {
      const res = await axios.get('/api/videos');
      setVideos(res.data.videos);

      if (res.data.videos.length > 0) {
        fetchAnnotation(res.data.videos[0]);
      }

      // 💥 新增：获取所有annotations数据
      const allRes = await axios.get('/api/annotations/all');
      setAllAnnotations(allRes.data || []);
    } catch (error) {
      console.error('Error fetching videos or annotations:', error);
    }
  };

  const fetchAnnotation = async (videoName) => {
    try {
      const res = await axios.get(`/api/annotations/${videoName}`);
      setAnnotationData(res.data || {});
    } catch (error) {
      console.error('Error fetching annotation:', error);
    }
  };

  const handleVideoChange = async (index) => {
    setCurrentVideoIndex(index);
    await fetchAnnotation(videos[index]);
    setStep('background');
  
    const allRes = await axios.get('/api/annotations/all');
    setAllAnnotations(allRes.data || []);
  };
  

  const handleSaveAnnotation = async (newData) => {
    const videoName = videos[currentVideoIndex];
    await axios.post(`/api/annotations/${videoName}`, newData);
    setAnnotationData(newData);

    // 保存完后刷新一下所有标注状态
    const allRes = await axios.get('/api/annotations/all');
    setAllAnnotations(allRes.data || []);
  };

  const getCurrentVideoSrc = () => {
    if (videos.length === 0) return '';
    const videoFileName = videos[currentVideoIndex];
    return DATA_DIR + videoFileName;
  };

  const getCurrentStartTime = () => {
    if (step === 'abnormal_event' && annotationData.abnormal_event?.timestamp) {
      return annotationData.abnormal_event.timestamp[0];
    }
    return 0;
  };

  const getCurrentEndTime = () => {
    if (step === 'abnormal_event' && annotationData.abnormal_event?.timestamp) {
      return annotationData.abnormal_event.timestamp[1];
    }
    return null;
  };

  // 💥 重点：根据 allAnnotations 判断每个视频是否填写完成
  const getAnnotationStatus = () => {
    const status = {};
    videos.forEach(videoName => {
      const matched = allAnnotations.find(item => {
        const fullPath = item.video || '';
        const shortName = fullPath.split('/').pop();
        return shortName === videoName;
      });

      if (!matched) {
        status[videoName] = 'unfinished';
        return;
      }

      const isBackgroundFilled = matched.background && matched.background.scene && matched.background.weather && matched.background.time;
      const isAbnormalEventFilled = matched.abnormal_event && matched.abnormal_event.description && matched.abnormal_event.anomaly_class;
      const isAbnormalObjectFilled = matched.abnormal_object && Array.isArray(matched.abnormal_object) && matched.abnormal_object.length > 0;

      if (isBackgroundFilled && isAbnormalEventFilled && isAbnormalObjectFilled) {
        status[videoName] = 'finished';
      } else {
        status[videoName] = 'unfinished';
      }
    });
    return status;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#1e1e1e', color: 'white' }}>
      {/* 左半部分 */}
      <div style={{ flex: 3, display: 'flex', flexDirection: 'column', padding: '20px' }}>
        {videos.length > 0 && (
          <>
            <div style={{ flex: '0 0 400px' }}>
              <VideoPlayer
                src={getCurrentVideoSrc()}
                startTime={getCurrentStartTime()}
                endTime={getCurrentEndTime()}
                autoLoop={true}
              />
            </div>

            {/* 填写区 */}
            <div style={{ flex: 1, marginTop: '20px' }}>
              <h2 style={{ marginBottom: '10px' }}>Step: {step}</h2>
              <AnnotationForm
                step={step}
                annotationData={annotationData}
                setAnnotationData={setAnnotationData}
                setStep={setStep}
                onSave={handleSaveAnnotation}
                videos={videos}                      
                currentVideoIndex={currentVideoIndex} 
                handleVideoChange={handleVideoChange} 
              />
            </div>
          </>
        )}
      </div>

      {/* 右半部分 */}
      <div style={{ flex: 1, borderLeft: '2px solid #333', padding: '20px', overflowY: 'auto' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Video List</h3>
        <NavigationPanel
          videos={videos}
          currentVideoIndex={currentVideoIndex}
          onVideoChange={handleVideoChange}
          annotationStatus={getAnnotationStatus()}
        />
      </div>
    </div>
  );
};

export default App;
