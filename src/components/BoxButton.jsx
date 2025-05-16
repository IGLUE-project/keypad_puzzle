import React from 'react';

const BoxButton = (props) => {
  return (
    <div className={"boxButton boxButton" + props.position} onClick={() => props.onClick(props.value)} style={{ width: props.boxWidth, height: props.boxHeight }}>
      <li>
        <p>{props.value}</p>
      </li>
    </div>
  );
};

export default BoxButton;