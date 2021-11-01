import React from 'react';
import Call from '../Calls/Participant/Call';
import Tray from '../Tray/Tray';

export default function ParticipantView({ roomUrl, disabled, onClickLeaveCall }) {
	return (
		<>
			<Call roomUrl={roomUrl} />
      <Tray
        disabled={disabled}
        onClickLeaveCall={onClickLeaveCall}
      />
    </>
	);
}