import React, { useContext, useEffect, useState } from 'react';
import css from './Cue.css';
import CallObjectContext from '../../CallObjectContext';

const CUES = {
  1: Cue1,
  2: Cue2,
  3: Cue3,
};

export default function Cue(props) {
  const callObject = useContext(CallObjectContext);
  const [cue, setCue] = useState('1');

  function handleCueChange(event) {
    if (!event.data.cue) {
      return;
    }

    setCue(event.data.cue);
  }

  useEffect(() => {
    if (!callObject) {
      return;
    }

    callObject.on('app-message', handleCueChange);

    return function cleanup() {
      callObject.off('app-message', handleCueChange);
    };
  }, [callObject]);

  const CueComponent = CUES[cue];

	return (
    <CueComponent />
	);
}

function Cue1(props) {
  return (
    <div className="cue cue1">Cue 1</div>
  );
}

function Cue2(props) {
  return (
    <div className="cue cue2">Cue 2</div>
  );
}

function Cue3(props) {
  return (
    <div className="cue cue3">Cue 3</div>
  );
}