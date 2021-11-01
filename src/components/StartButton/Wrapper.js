import React from 'react';
import './Wrapper.css';

export default function Wrapper(props) {
  return (
    <div className="start-button-wrapper">
      {props.children}
    </div>
  );
}
