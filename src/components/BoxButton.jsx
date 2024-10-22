import React from 'react';

const BoxButton = (props) => {
  return (
    <div className={"boxButton boxButton" + props.position} onClick={() => props.onClick(props.value)}>
      <li>
        <p>{props.value}</p>
      </li>
    </div>
  );
};

export default BoxButton;