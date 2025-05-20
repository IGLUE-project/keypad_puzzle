import React, { useContext } from 'react';
import { GlobalContext } from "./GlobalContext";

const BoxButton = (props) => {
  const {  appSettings } = useContext(GlobalContext);
  return (
    <div className={"boxButton boxButton" + props.position} onClick={() => props.onClick(props.value)} style={{ width: props.boxWidth, height: props.boxHeight, backgroundImage: 'url("' + appSettings.backgroundKey + '")' }}>
      <li>
        <p>{props.value}</p>
      </li>
    </div>
  );
};

export default BoxButton;