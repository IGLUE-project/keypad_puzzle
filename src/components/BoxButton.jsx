import React, { useContext } from 'react';
import { GlobalContext } from "./GlobalContext";

const BoxButton = (props) => {
  const {  appSettings } = useContext(GlobalContext);

  const renderContent = () => {
    switch (appSettings.keysType) {
      case "COLORS":
        return "";
      case "SYMBOLS":
        return <img className="symbol" src={appSettings.symbolsBackgroundKeys[props.position-1]}></img>;
      default:
        return <p>{props.value}</p>;
    }
  };

  return (
    <div
      className={"boxButton boxButton" + props.position}
      onClick={() => props.onClick(props.value)}
      style={{
        width: props.boxWidth,
        height: props.boxHeight,
        backgroundImage: 'url("' + appSettings.backgroundKeys[props.position-1] + '")',
      }}
    >
      <div>{renderContent()}</div>
    </div>
  );
};

export default BoxButton;