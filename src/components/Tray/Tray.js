import React, { useContext, useEffect, useState } from 'react';
import './Tray.css';
import TrayButton, {
  TYPE_MUTE_CAMERA,
  TYPE_MUTE_MIC,
  TYPE_RAISE,
  TYPE_LEAVE,
} from '../TrayButton/TrayButton';
import CallObjectContext from '../../CallObjectContext';
import { logDailyEvent } from '../../logUtils';
import DeviceSelector from '../DeviceSelector/DeviceSelector';

/**
 * Gets [isCameraMuted, isMicMuted].
 * This function is declared outside Tray() so it's not recreated every render
 * (which would require us to declare it as a useEffect dependency).
 */
function getStreamStates(callObject) {
  let isCameraMuted,
    isMicMuted;
  if (
    callObject &&
    callObject.participants() &&
    callObject.participants().local
  ) {
    const localParticipant = callObject.participants().local;
    isCameraMuted = !localParticipant.video;
    isMicMuted = !localParticipant.audio;
  }
  return [isCameraMuted, isMicMuted];
}

/**
 * Props:
 * - onClickLeaveCall: () => ()
 * - disabled: boolean
 */
export default function Tray(props) {
  const callObject = useContext(CallObjectContext);
  const [isCameraMuted, setCameraMuted] = useState(false);
  const [isMicMuted, setMicMuted] = useState(false);
  const [isRaised, setRaised] = useState(false);

  function toggleCamera() {
    callObject.setLocalVideo(isCameraMuted);
  }

  function toggleMic() {
    callObject.setLocalAudio(isMicMuted);
  }

  function raiseHand() {
    setRaised(!isRaised);
  }

  function leaveCall() {
    props.onClickLeaveCall && props.onClickLeaveCall();
  }

  /**
   * Start listening for participant changes when callObject is set (i.e. when the component mounts).
   * This event will capture any changes to your audio/video mute state.
   */
  useEffect(() => {
    if (!callObject) return;

    function handleNewParticipantsState(event) {
      event && logDailyEvent(event);
      const [isCameraMuted, isMicMuted] = getStreamStates(
        callObject
      );
      setCameraMuted(isCameraMuted);
      setMicMuted(isMicMuted);
    }

    // Use initial state
    handleNewParticipantsState();

    // Listen for changes in state
    callObject.on('participant-updated', handleNewParticipantsState);

    // Stop listening for changes in state
    return function cleanup() {
      callObject.off('participant-updated', handleNewParticipantsState);
    };
  }, [callObject]);

  // broadcast the raised hand
  useEffect(() => {
    if (!callObject) return;

    const { local } = callObject.participants();
    if (local) {
      callObject.sendAppMessage({ sessionId: local.session_id, isRaised });
    }
  }, [callObject, isRaised]);

  return (
    <div className="tray">

      <TrayButton
        type={TYPE_MUTE_CAMERA}
        disabled={props.disabled}
        highlighted={isCameraMuted}
        onClick={toggleCamera}
      />
      <DeviceSelector type='video' />
      <TrayButton
        type={TYPE_MUTE_MIC}
        disabled={props.disabled}
        highlighted={isMicMuted}
        onClick={toggleMic}
      />
      <DeviceSelector type='audio' />
      <TrayButton
        type={TYPE_RAISE}
        disabled={props.disabled}
        highlighted={isRaised}
        onClick={raiseHand}
      />
      <TrayButton
        type={TYPE_LEAVE}
        disabled={props.disabled}
        newButtonGroup={true}
        highlighted={true}
        onClick={leaveCall}
      />
    </div>
  );
}
