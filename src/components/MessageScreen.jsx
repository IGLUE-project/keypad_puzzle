import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from "./GlobalContext";
import './../assets/scss/message.scss';

const MessageScreen = (props) => {
  const { escapp, appSettings, Utils, I18n } = useContext(GlobalContext);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerMarginRight, setContainerMarginRight] = useState(0);
  const [containerMarginTop, setContainerMarginTop] = useState(0);

  useEffect(() => {
    handleResize();
  }, [props.appWidth, props.appHeight]);

  function handleResize(){
    if((props.appHeight === 0)||(props.appWidth === 0)){
      return;
    }

    let aspectRatio = 4 / 3;
    let _keypadWidth = Math.min(props.appHeight * aspectRatio, props.appWidth);
    let _keypadHeight = _keypadWidth / aspectRatio;

    let _containerWidth;
    let _containerHeight;
    let _containerMarginRight;
    let _containerMarginTop;

    switch(appSettings.skin){
      case "RETRO":
        _containerWidth = _keypadWidth * 0.4;
        _containerHeight = _keypadHeight * 0.4;
        _containerMarginRight = 0;
        _containerMarginTop = - _keypadHeight * 0.05;
        break;
      case "FUTURISTIC":
      default:
        //Standard skin
        _containerWidth = _keypadWidth * 0.49;
        _containerHeight = _keypadHeight * 0.5;
        _containerMarginRight = _keypadWidth * 0.018;
        _containerMarginTop = _keypadHeight * 0.03;
    }

    setContainerWidth(_containerWidth);
    setContainerHeight(_containerHeight);
    setContainerMarginRight(_containerMarginRight);
    setContainerMarginTop(_containerMarginTop);
  }

  let backgroundImage = 'url("' + appSettings.backgroundMessage + '")';
  if(appSettings.background && appSettings.background !== "NONE"){
    backgroundImage += ', url("' + appSettings.background + '")';
  }

  return (
    <div id="screen_message" className="screen_content" style={{ backgroundImage: backgroundImage }}>
      <div id="message_text" style={{ width: containerWidth, height: containerHeight, marginRight: containerMarginRight, marginTop: containerMarginTop }}>
        <pre>{appSettings.message}</pre>
      </div>
      <div className="message_button" onClick={() => props.submitPuzzleSolution()}>{I18n.getTrans("i.continue")}</div>
    </div>
  );
};

export default MessageScreen;