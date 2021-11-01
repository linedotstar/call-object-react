import React, { useContext } from 'react';
import css from './ParticipantList.css';
import CallObjectContext from '../../CallObjectContext';

export default function ParticipantList(props) {
	const callObject = useContext(CallObjectContext);
  const participants = (callObject && callObject.participants()) || {};

  return (
    <ul className='participant-list'>
      {Object.entries(participants).map(([id, participant], index) => (
        <li key={index}>
          {participant.user_name}
        </li>
      ))}
    </ul>
  );
}