import React, { useContext, useEffect, useState } from 'react';
import CallObjectContext from '../../CallObjectContext';

const DEVICE_MAP = {
  audio: 'mic',
  video: 'camera',
};

export default function DeviceSelector(props) {
	const callObject = useContext(CallObjectContext);
  const [devices, setDevices] = useState([]);
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

  function onSelect(e) {
    console.log(e.target.value);
    const updates = {};
    updates[`${type}DeviceId`] = e.target.value;
    callObject.setInputDevices(updates);
  }

  return (
    <select 
      className='devices'
      onChange={onSelect}
    >
      {devices.map(({kind, label, deviceId}, index) => (
        <option key={`device-${index}`} value={deviceId} selected={deviceId === currentDeviceId ? 'selected' : null}>
          {label}
        </option>
      ))}
    </select>
  );
}