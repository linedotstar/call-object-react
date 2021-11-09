import React, { useContext, useEffect } from 'react';
import CallObjectContext from '../../../CallObjectContext';
import './Gallery.css';
import Tile from '../../Tile/Tile';

export default function Gallery(props) {
  const callObject = useContext(CallObjectContext);
	const { callState: { callItems, hostId, guestId } } = props;

  const { [hostId]: host, [guestId]: guest, local, ...items } = callItems;

  useEffect(() => {
    let updateList = {};
    Object.values(items).slice(0, 4).forEach((item) => (
      updateList[item.sessionId] = { setSubscribedTracks: { video: true } }
    ));
    callObject && callObject.updateParticipants(updateList);
  }, [items]);

  const viewable = Object.values(items).filter((item) => {
    return (item.videoTrackState || {}).state === 'playable';
  });

  console.log(viewable);

  return (
    <div className='gallery'>
      {local && (
        <Tile
          key={local.id}
          videoTrackState={local.videoTrackState}
          audioTrackState={local.audioTrackState}
          isLocalPerson={true}
          isLarge={false}
          isPiP={false}
          disableCornerMessage={true}
        />
      )}
      {viewable.map((item) => (
        <Tile
          key={item.id}
          videoTrackState={item.videoTrackState}
          audioTrackState={item.audioTrackState}
          isLocalPerson={false}
          isLarge={false}
          isPiP={false}
          disableCornerMessage={true}
        />
      ))}
    </div>
	);
}