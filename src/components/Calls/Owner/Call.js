import React, { useEffect, useContext, useReducer } from 'react';
import '../Call.css';
import './Call.css';
import Tile from '../../Tile/Tile';
import TileControls from './TileControls';
import Chat from '../../Chat/Chat';
import CallObjectContext from '../../../CallObjectContext';
import CallMessage from '../../CallMessage/CallMessage';
import {
  initialCallState,
  CLICK_ALLOW_TIMEOUT,
  PARTICIPANTS_CHANGE,
  CAM_OR_MIC_ERROR,
  FATAL_ERROR,
  callReducer,
  isLocal,
  getMessage,
} from '../callState';
import { logDailyEvent } from '../../../logUtils';

export default function OwnerCall() {
  const callObject = useContext(CallObjectContext);
  const [callState, dispatch] = useReducer(callReducer, initialCallState);

  /**
   * Subscribe to audience tracks when they join.
   */
  useEffect(() => {
    if (!callObject) return;

    function subscribeToParticipant({ participant }) {
      callObject.updateParticipant(participant.session_id, {
        setSubscribedTracks: { audio: false, video: true, screenVideo: false },
      });
      callObject.updateReceiveSettings({ [participant.session_id]: { video: { layer: 0 } } });
    }

    callObject.on('participant-joined', subscribeToParticipant);
    
    // Stop listening for changes in state
    return function cleanup() {
      callObject.off('participant-joined', subscribeToParticipant);
    };
  }, [callObject]);

  /**
   * Start listening for participant changes, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) return;

    const events = [
      'participant-joined',
      'participant-updated',
      'participant-left',
    ];

    function handleNewParticipantsState(event) {
      event && logDailyEvent(event);
      dispatch({
        type: PARTICIPANTS_CHANGE,
        participants: callObject.participants(),
      });
    }

    // Use initial state
    handleNewParticipantsState();

    // Listen for changes in state
    for (const event of events) {
      callObject.on(event, handleNewParticipantsState);
    }

    // Stop listening for changes in state
    return function cleanup() {
      for (const event of events) {
        callObject.off(event, handleNewParticipantsState);
      }
    };
  }, [callObject]);

  /**
   * Start listening for call errors, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) return;

    function handleCameraErrorEvent(event) {
      logDailyEvent(event);
      dispatch({
        type: CAM_OR_MIC_ERROR,
        message:
          (event && event.errorMsg && event.errorMsg.errorMsg) || 'Unknown',
      });
    }

    // We're making an assumption here: there is no camera error when callObject
    // is first assigned.

    callObject.on('camera-error', handleCameraErrorEvent);

    return function cleanup() {
      callObject.off('camera-error', handleCameraErrorEvent);
    };
  }, [callObject]);

  /**
   * Start listening for fatal errors, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) return;

    function handleErrorEvent(e) {
      logDailyEvent(e);
      dispatch({
        type: FATAL_ERROR,
        message: (e && e.errorMsg) || 'Unknown',
      });
    }

    // We're making an assumption here: there is no error when callObject is
    // first assigned.

    callObject.on('error', handleErrorEvent);

    return function cleanup() {
      callObject.off('error', handleErrorEvent);
    };
  }, [callObject]);

  /**
   * Start a timer to show the "click allow" message, when the component mounts.
   */
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch({ type: CLICK_ALLOW_TIMEOUT });
    }, 2500);

    return function cleanup() {
      clearTimeout(t);
    };
  }, []);

  function updateCue(cue) {
    callObject && callObject.sendAppMessage({ cue });
  }

  function getTiles() {
    let tiles = [];
    Object.entries(callState.callItems).forEach(([id, callItem]) => {
      const tile = (
        <div key={`participant-${id}`} className='participant'>
          <Tile
            videoTrackState={callItem.videoTrackState}
            audioTrackState={callItem.audioTrackState}
            isLocalPerson={false}
            disableCornerMessage={true}
          />
          <TileControls 
            sessionId={callItem.sessionId}
            participantId={callItem.id}
            userName={callItem.userName}
          />
        </div>
      );
      if (!isLocal(id)) {
        tiles.push(tile);
      }
    });
    return tiles;
  }

  const tiles = getTiles();
  const message = getMessage(callState);
  return (
    <div className="call owner">
      <div className='cue-controls'>
        <button onClick={() => updateCue(1)}>Cue 1</button>
        <button onClick={() => updateCue(2)}>Cue 2</button>
        <button onClick={() => updateCue(3)}>Cue 3</button>
      </div>
      <div className="gallery">{tiles}</div>
      <Chat />
      {message && (
        <CallMessage
          header={message.header}
          detail={message.detail}
          isError={message.isError}
        />
      )}
    </div>
  );
}
