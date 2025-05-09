import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnnotationForm = ({ step, annotationData, setAnnotationData, setStep, videos, currentVideoIndex, handleVideoChange }) => {
  const [background, setBackground] = useState({ scene: '', weather: '', time: '' });
  const [abnormalEvent, setAbnormalEvent] = useState({ description: '', anomaly_class: '', timestamp: [0, 0], num_seconds: 10 });
  const [abnormalObjects, setAbnormalObjects] = useState([]);
  const [videoDuration, setVideoDuration] = useState(10); // 默认10秒，之后根据真实情况更新

  useEffect(() => {
    if (annotationData.background) {
      setBackground(annotationData.background);
    }
    if (annotationData.abnormal_event) {
      setAbnormalEvent(annotationData.abnormal_event);
      if (annotationData.abnormal_event.num_seconds) {
        setVideoDuration(annotationData.abnormal_event.num_seconds); // ✅ 正确从json读取视频总时长
      }
    }

    if (annotationData.abnormal_object) {
      const abnormalStart = annotationData.abnormal_event?.timestamp?.[0] ?? 0;
      const abnormalEnd = annotationData.abnormal_event?.timestamp?.[1] ?? 0;

      const fixedObjects = annotationData.abnormal_object.map((obj, idx) => {
        let events = obj.event || [];

        return {
          id: obj.id ?? idx,
          name: obj.name || '',
          description: obj.description || '',
          event: [
            events[0] || { caption: '', timestamp: [0, abnormalStart], abnormal: 0 },
            events[1] || { caption: '', timestamp: [abnormalStart, abnormalEnd], abnormal: 1 },
            events[2] || { caption: '', timestamp: [abnormalEnd, annotationData.abnormal_event?.num_seconds ?? 10], abnormal: 0 }
          ]
        };
      });

      setAbnormalObjects(fixedObjects);
    } else {
      setAbnormalObjects([createNewAbnormalObject(0)]);
    }
  }, [annotationData]);

  const createNewAbnormalObject = (id) => {
    const abnormalStart = abnormalEvent?.timestamp?.[0] ?? 0;
    const abnormalEnd = abnormalEvent?.timestamp?.[1] ?? 0;
    return {
      id,
      name: '',
      description: '',
      event: [
        { caption: '', timestamp: [0, abnormalStart], abnormal: 0 },
        { caption: '', timestamp: [abnormalStart, abnormalEnd], abnormal: 1 },
        { caption: '', timestamp: [abnormalEnd, videoDuration], abnormal: 0 }
      ]
    };
  };

  const handleSubmit = async () => {
    const updatedData = { ...annotationData };
    if (step === 'background') {
      updatedData.background = background;
      setAnnotationData(updatedData);
      setStep('abnormal_event');
    } else if (step === 'abnormal_event') {
      updatedData.abnormal_event = abnormalEvent;
      setAnnotationData(updatedData);
      setStep('abnormal_object');
    } else if (step === 'abnormal_object') {
      updatedData.abnormal_object = abnormalObjects;
      setAnnotationData(updatedData);

      const videoName = videos[currentVideoIndex];
      await axios.post(`/api/annotations/${videoName}`, updatedData); // ✅ 这里加了反引号

      if (currentVideoIndex < videos.length - 1) {
        handleVideoChange(currentVideoIndex + 1);
      } else {
        alert('所有视频已完成标注！');
      }
    }
  };

  const handleObjectChange = (index, field, value) => {
    const updatedObjects = [...abnormalObjects];
    updatedObjects[index][field] = value;
    setAbnormalObjects(updatedObjects);
  };

  const handleEventCaptionChange = (objIdx, eventIdx, value) => {
    const updatedObjects = [...abnormalObjects];
    updatedObjects[objIdx].event[eventIdx].caption = value;
    setAbnormalObjects(updatedObjects);
  };

  const handleEventTimeChange = (objIdx, eventIdx, pos, value) => {
    const updatedObjects = [...abnormalObjects];
    updatedObjects[objIdx].event[eventIdx].timestamp[pos] = parseFloat(value);
    setAbnormalObjects(updatedObjects);
  };

  const addNewAbnormalObject = () => {
    const newId = abnormalObjects.length;
    const newObj = createNewAbnormalObject(newId);
    setAbnormalObjects([...abnormalObjects, newObj]);
  };

  const renderEventBox = (ev, eventIdx, objIdx) => {
    const abnormalText = ev.abnormal ? "Abnormal" : "Normal";
    const abnormalStart = abnormalEvent.timestamp?.[0] ?? 0;
    const abnormalEnd = abnormalEvent.timestamp?.[1] ?? 0;
    const finalVideoEnd = videoDuration;

    let startTime = ev.timestamp[0];
    let endTime = ev.timestamp[1];

    if (eventIdx === 0) {
      startTime = startTime ?? 0;
      endTime = abnormalStart;
    } else if (eventIdx === 1) {
      startTime = abnormalStart;
      endTime = abnormalEnd;
    } else if (eventIdx === 2) {
      startTime = abnormalEnd;
      endTime = endTime ?? finalVideoEnd;
    }

    return (
      <div key={eventIdx} style={{ flex: 1, margin: '5px', border: '1px solid #888', padding: '8px', borderRadius: '5px' }}>
        <h5>Event {eventIdx + 1} ({abnormalText})</h5>
        <div>
          <div>Caption</div>
          <input
            value={ev.caption}
            onChange={(e) => handleEventCaptionChange(objIdx, eventIdx, e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '5px' }}>
          <div>Start Time</div>
          <input
            type="text"
            value={startTime}
            onChange={(e) => (eventIdx === 0 ? handleEventTimeChange(objIdx, eventIdx, 0, e.target.value) : null)}
            disabled={eventIdx !== 0}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginTop: '5px' }}>
          <div>End Time</div>
          <input
            type="text"
            value={endTime}
            onChange={(e) => (eventIdx === 2 ? handleEventTimeChange(objIdx, eventIdx, 1, e.target.value) : null)}
            disabled={eventIdx !== 2}
            style={{ width: '100%' }}
          />
        </div>
      </div>
    );
  };

  return (
    <div>
      {step === 'background' && (
        <>
          <h3>Background Information</h3>
          <div style={{ marginBottom: '10px' }}>
            <div>Scene</div>
            <small>Example: A tree-lined highway with dense greenery on both sides and buildings on the left side</small>
            <input value={background.scene} onChange={(e) => setBackground({ ...background, scene: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div>Weather</div>
            <small>Example: sunny, rainy, snowy...</small>
            <input value={background.weather} onChange={(e) => setBackground({ ...background, weather: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div>Time</div>
            <small>Example: daytime, night, dusk, dawn...</small>
            <input value={background.time} onChange={(e) => setBackground({ ...background, time: e.target.value })} style={{ width: '100%' }} />
          </div>
        </>
      )}

      {step === 'abnormal_event' && (
        <>
          <h3>Abnormal Event Information</h3>
          <div style={{ marginBottom: '10px' }}>
            <div>Description</div>
            <small>Example: The ego vehicle collides with the white car from the left rear as it slows down before the crosswalk.</small>
            <input value={abnormalEvent.description} onChange={(e) => setAbnormalEvent({ ...abnormalEvent, description: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <div>Anomaly Class</div>
            <small>Example: ego: moving_ahead_or_waiting</small>
            <input value={abnormalEvent.anomaly_class} onChange={(e) => setAbnormalEvent({ ...abnormalEvent, anomaly_class: e.target.value })} style={{ width: '100%' }} />
          </div>
        </>
      )}

      {step === 'abnormal_object' && (
        <>
          <h3>Abnormal Object Information</h3>
          {abnormalObjects.map((obj, idx) => (
            <div key={obj.id} style={{ marginBottom: '20px', border: '2px solid #555', padding: '10px', borderRadius: '8px' }}>
              <h4>Object {idx + 1}</h4>
              <div>Name</div>
              <input value={obj.name} onChange={(e) => handleObjectChange(idx, 'name', e.target.value)} style={{ width: '100%' }} />
              <div style={{ marginTop: '10px' }}>Description</div>
              <input value={obj.description} onChange={(e) => handleObjectChange(idx, 'description', e.target.value)} style={{ width: '100%' }} />
              <div style={{ display: 'flex', marginTop: '15px' }}>
                {obj.event.map((ev, eventIdx) => renderEventBox(ev, eventIdx, idx))}
              </div>
            </div>
          ))}
          <button onClick={addNewAbnormalObject} style={{ marginTop: '10px', padding: '8px 16px' }}>
            Add New Abnormal Object
          </button>
        </>
      )}

      <button onClick={handleSubmit} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
        {step === 'abnormal_object' ? 'Next' : 'Submit'}
      </button>
    </div>
  );
};

export default AnnotationForm;
