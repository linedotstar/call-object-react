import React, { useContext, useEffect, useState } from 'react';
import css from './DeviceSelector.css';
import CallObjectContext from '../../CallObjectContext';

const DEVICE_MAP = {
  audio: 'mic',
  video: 'camera',
};

export default function DeviceSelector(props) {
	const callObject = useContext(CallObjectContext);
  const [devices, setDevices] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState([]);
  const { type } = props;
  
  useEffect(() => {
    callObject && callObject.enumerateDevices().then(({ devices }) => {
      const filteredDevices = devices.filter((device) => device.kind === `${type}input`);
      setDevices(filteredDevices);
    });
  }, [callObject]);

  useEffect(() => {
    callObject && callObject.getInputDevices().then((result) => {
      setCurrentDeviceId(result[DEVICE_MAP[type]].deviceId);
    });
  }, [callObject]);

  function onSelect(deviceId) {
    callObject.setInputDevices({ [`${type}DeviceId`]: deviceId });
    setCurrentDeviceId(deviceId);
    setOpen(false);
  }

  return (
    <div className='device-selector'>
      <button onClick={() => setOpen(!open)}>^</button>
      
      {open && (
        <ul className='device-menu'>
          {devices.map(({label, deviceId}, index) => (
            <li 
              key={`device-${index}`} 
              onClick={() => onSelect(deviceId)} 
              className={deviceId === currentDeviceId ? 'selected' : null}
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


// <select 
//   className='devices'
//   onChange={onSelect}
// >
//   {devices.map(({label, deviceId}, index) => (
//     <option key={`device-${index}`} value={deviceId} selected={deviceId === currentDeviceId ? 'selected' : null}>
//       {label}
//     </option>
//   ))}
// </select>