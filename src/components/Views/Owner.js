import React from 'react';
import Call from '../Calls/Owner/Call';
import Tray from '../Tray/Tray';

export default function OwnerView({ roomUrl, disabled, onClickLeaveCall }) {
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