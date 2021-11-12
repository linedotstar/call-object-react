import React, { useContext, useEffect } from 'react';
import CallObjectContext from '../../../CallObjectContext';
import './Gallery.css';
import Tile from '../../Tile/Tile';

export default function Gallery(props) {
  const callObject = useContext(CallObjectContext);
	const { callState: { callItems, hostId, guestId } } = props;
  const { [hostId]: host, [guestId]: guest, local, ...items } = callItems;

  const sessionIds = Object.values(items).map((item) => item.sessionId).sort();
  const eligibleIds = Object.values(items).filter((item) => 
      ['sendable', 'playable'].includes((item.videoTrackState || {}).state)
    ).map((item) => item.sessionId).sort().slice(0, 12);

  useEffect(() => {
    if (!callObject) {
      return;
    }

    let receiveSettingsList = {};
    let updateList = {};
    sessionIds.forEach((sessionId) => {
      const isEligible = eligibleIds.includes(sessionId);
      receiveSettingsList[sessionId] = isEligible ? { video: { layer: 0 } } : 'inherit';
      updateList[sessionId] = { setSubscribedTracks: { video: isEligible } };
    });
    callObject.updateReceiveSettings(receiveSettingsList);
    callObject.updateParticipants(updateList);
  }, [callObject, sessionIds, eligibleIds]);

  const members = eligibleIds.map((memberId) => items[memberId]).filter((member) => (member.videoTrackState || {}).state === 'playable');

  return (
    <div className='gallery'>
      {local && (
        <Tile
          key={local.sessionId}
          videoTrackState={local.videoTrackState}
          isLocalPerson={true}
          isLarge={false}
          isPiP={false}
          disableCornerMessage={true}
        />
      )}
      {members.map((item) => (
        <Tile
          key={item.sessionId}
          videoTrackState={item.videoTrackState}
          isLocalPerson={false}
          isLarge={false}
          isPiP={false}
          disableCornerMessage={true}
        />
      ))}
    </div>
	);
}