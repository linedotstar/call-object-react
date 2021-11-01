import React, { useContext, useCallback, useState } from 'react';
import css from './TileControls.css';
import CallObjectContext from '../../../CallObjectContext';

/* Props:
  - sessionId
  - participantId
  - userName
*/
export default function TileControls(props) {
  const callObject = useContext(CallObjectContext);
  const [onStage, setOnStage] = useState(false);

  const bringOnStage = useCallback(
    () => {
      callObject &&
        callObject.updateParticipant(props.sessionId, {
          setAudio: true,
          setVideo: true,
        });
      setOnStage(true);
    },
    [callObject]
  );

  const takeOffStage = useCallback(
    () => {
      callObject &&
        callObject.updateParticipant(props.sessionId, {
          setAudio: false,
          setVideo: true,
        });
      setOnStage(false);
    },
    [callObject]
  );

  /**
   * Send an app message to the remote participant whose tile was clicked on.
   */
  const sendHello = useCallback(
    () => {
      callObject &&
        callObject.sendAppMessage({ message: `Hello, ${props.userName}!` }, props.participantId);
    },
    [callObject]
  );

  const ejectParticipant = useCallback(
    () => {
      callObject &&
        callObject.updateParticipant(props.sessionId, {
          eject: true,
        });
      setOnStage(false);
    },
    [callObject]
  );

  return (
    <div className="tile-controls">
      <p>{props.userName}</p>
      {onStage ? (
        <button onClick={takeOffStage}>Take off Stage</button>
      ) : (
        <button onClick={bringOnStage}>Bring on Stage</button>
      )}
      <button onClick={sendHello}>Say Hello</button>
      <button onClick={ejectParticipant}>Eject</button>
    </div>
  );
}