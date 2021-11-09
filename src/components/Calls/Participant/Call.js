import React, { useEffect, useContext, useReducer, useCallback } from 'react';
import './Call.css';
import '../Call.css';
import Cue from '../../Cue/Cue';
import Tile from '../../Tile/Tile';
import CallObjectContext from '../../../CallObjectContext';
import CallMessage from '../../CallMessage/CallMessage';
import {
  initialCallState,
  CLICK_ALLOW_TIMEOUT,
  PARTICIPANTS_CHANGE,
  HOST_CHANGE,
  GUEST_CHANGE,
  CAM_OR_MIC_ERROR,
  FATAL_ERROR,
  callReducer,
  isLocal,
  isScreenShare,
  containsScreenShare,
  getMessage,
  isHost,
  isGuest,
} from '../callState';
import { logDailyEvent } from '../../../logUtils';

export default function Call() {
  const callObject = useContext(CallObjectContext);
  const [callState, dispatch] = useReducer(callReducer, initialCallState);

  /**
   * Start listening for new owner participant changes, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) return;

    function handleParticipantJoinedState({ participant }) {
      if (participant.owner) {
        callObject.updateParticipant(participant.session_id, {
          setSubscribedTracks: { audio: true, video: true, screenVideo: false },
        });
        dispatch({
          type: HOST_CHANGE,
          hostId: participant.session_id,
        });
      }
    }

    callObject.on('participant-joined', handleParticipantJoinedState);

    // Stop listening for changes in state
    return function cleanup() {
      callObject.off('participant-joined', handleParticipantJoinedState);
    };
  }, [callObject]);

  /**
   * Start listening for new app messages, when the callObject is set.
   */
  useEffect(() => {
    if (!callObject) return;

    function handleAppMessage(event) {
      debugger;
      if (event.data && event.data.sessionId && event.data.subscriptions) {
        callObject.updateParticipant(event.data.sessionId, { setSubscribedTracks: event.data.subscriptions });
        dispatch({
          type: GUEST_CHANGE,
          guestId: event.data.isGuest ? event.data.sessionId : null,
        });
      }
    }

    callObject.on('app-message', handleAppMessage);

    // Stop listening for changes in state
    return function cleanup() {
      callObject.off('app-message', handleAppMessage);
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

  /**
   * Send an app message to the remote participant whose tile was clicked on.
   */
  const sendHello = useCallback(
    (participantId) => {
      callObject &&
        callObject.sendAppMessage({ hello: 'world' }, participantId);
    },
    [callObject]
  );

  function getTiles() {
    let largeTiles = [];
    let smallTiles = [];
    Object.entries(callState.callItems).forEach(([id, callItem]) => {
      const isLarge = (callItem.videoTrackState || {}).state === 'playable' && (isHost(callItem.sessionId, callState) || isGuest(callItem.sessionId, callState));
      console.log(isHost(id, callState));
      const tile = (
        <Tile
          key={id}
          videoTrackState={callItem.videoTrackState}
          audioTrackState={callItem.audioTrackState}
          isLocalPerson={isLocal(id)}
          isLarge={isLarge}
          disableCornerMessage={isScreenShare(id)}
          onClick={
            isLocal(id)
              ? null
              : () => {
                  sendHello(id);
                }
          }
        />
      );
      if (isLarge) {
        largeTiles.push(tile);
      } else if (isLocal(id)) {
        smallTiles.push(tile);
      }
    });
    return [largeTiles, smallTiles];
  }

  const [largeTiles, smallTiles] = getTiles();
  const message = getMessage(callState);
  return (
    <div className="call participant">
      <Cue />
      <div className="large-tiles">
        {
          !message
            ? largeTiles
            : null /* Avoid showing large tiles to make room for the message */
        }
      </div>
      <div className="small-tiles">{smallTiles}</div>
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
