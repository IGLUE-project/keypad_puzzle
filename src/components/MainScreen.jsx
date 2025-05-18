import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from "./GlobalContext";
import './../assets/scss/main.scss';

import BoxButton from './BoxButton.jsx';

const MainScreen = (props) => {
  const { escapp, Utils, I18n } = useContext(GlobalContext);
  const [currentSolution, setCurrentSolution] = useState([]);
  const [processingSolution, setProcessingSolution] = useState(false);
  const [light, setLight] = useState("off");
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerMarginLeft, setContainerMarginLeft] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);
  const [boxHeight, setBoxHeight] = useState(0);
  const [lightLeft, setLightLeft] = useState(0);
  const [lightTop, setLightTop] = useState(0);

  useEffect(() => {
    handleResize();
  }, [props.appWidth, props.appHeight]);

  function handleResize(){
    let aspectRatio = 4 / 3;
    let _keypadWidth = Math.min(props.appHeight * aspectRatio, props.appWidth);
    let _keypadHeight = _keypadWidth / aspectRatio;

    let _containerWidth = _keypadWidth * 0.22;
    let _containerHeight = _keypadHeight * 0.4;
    let _containerMarginLeft = _keypadWidth * 0.045;

    let _boxWidth = _keypadWidth * 0.06;
    let _boxHeight = _keypadHeight * 0.1;

    let _lightLeft = props.appWidth / 2 + _keypadWidth / 2 * 0.3;
    let _lightTop = props.appHeight / 2 - _keypadHeight / 2 * 0.4;


    setContainerWidth(_containerWidth);
    setContainerHeight(_containerHeight);
    setContainerMarginLeft(_containerMarginLeft);

    setBoxWidth(_boxWidth);
    setBoxHeight(_boxHeight);

    setLightLeft(_lightLeft);
    setLightTop(_lightTop);
  }

  const onClickButton = (value) => {
    if (processingSolution) {
      return;
    }
    Utils.log("onClickButton", value);
    setProcessingSolution(true);

    const shortBeep = document.getElementById("audio_beep");
    shortBeep.pause();
    shortBeep.currentTime = 0;
    shortBeep.play();

    setTimeout(() => {
      currentSolution.push(value);

      let appSettings = escapp.getAppSettings();
      if (currentSolution.length < appSettings.solutionLength) {
        setCurrentSolution(currentSolution);
        setProcessingSolution(false);
      } else {
        const solution = currentSolution.join("");
        setCurrentSolution([]);
        Utils.log("Check solution", solution);
        escapp.checkNextPuzzle(solution, {}, (success) => {
          try {
            setTimeout(() => {
              changeBoxLight(success, solution);
            }, 700);
          } catch(e){
            Utils.log("Error in checkNextPuzzle",e);
          }
        });
      }
    }, 300);
  }

  const changeBoxLight = (success, solution) => {
    let audio;

    if (success) {
      audio = document.getElementById("audio_success");
      setLight("green");
    } else {
      audio = document.getElementById("audio_failure");
      setLight("red");
    }

    setTimeout(() => {
      setLight("off");
      afterChangeBoxLight(success, solution);
    }, 1000);

    audio.play();
  }

  const afterChangeBoxLight = (success, solution) => {
    setProcessingSolution(false);
    if (success) {
      return props.onKeypadSolved(solution);
    }
  };

  return (<div id="screen_main" className={"screen_wrapper"}>
      <div id="keypad_container" style={{ width: containerWidth, height: containerHeight, marginLeft: containerMarginLeft }}>
          <audio id="audio_beep" src="sounds/beep-short.mp3" autostart="false" preload="auto" />
          <audio id="audio_failure" src="sounds/access-denied.mp3" autostart="false" preload="auto" />
          <audio id="audio_success" src="sounds/correct.mp3" autostart="false" preload="auto" />
          <div id="row1" className="row">
            <BoxButton value={"1"} position={1} onClick={onClickButton} boxHeight={boxHeight} boxWidth={boxWidth} />
            <BoxButton value={"2"} position={2} onClick={onClickButton} boxHeight={boxHeight} boxWidth={boxWidth} />
            <BoxButton value={"3"} position={3} onClick={onClickButton} boxHeight={boxHeight} boxWidth={boxWidth} />
          </div>
          <div id="row2" className="row">
            <BoxButton value={"4"} position={4} onClick={onClickButton} boxHeight={boxHeight} boxWidth={boxWidth} />
            <BoxButton value={"5"} position={5} onClick={onClickButton} boxHeight={boxHeight} boxWidth={boxWidth} />
            <BoxButton value={"6"} position={6} onClick={onClickButton} boxHeight={boxHeight} boxWidth={boxWidth} />
          </div>
          <div id="row3" className="row">
            <BoxButton value={"7"} position={7} onClick={onClickButton} boxHeight={boxHeight} boxWidth={boxWidth} />
            <BoxButton value={"8"} position={8} onClick={onClickButton} boxHeight={boxHeight} boxWidth={boxWidth} />
            <BoxButton value={"9"} position={9} onClick={onClickButton} boxHeight={boxHeight} boxWidth={boxWidth} />
          </div>
          <div id="row4" className="row">
            <BoxButton value={"*"} position={10} onClick={onClickButton} boxHeight={boxHeight} boxWidth={boxWidth} />
            <BoxButton value={"0"} position={11} onClick={onClickButton} boxHeight={boxHeight} boxWidth={boxWidth} />
            <BoxButton value={"#"} position={12} onClick={onClickButton} boxHeight={boxHeight} boxWidth={boxWidth} />
          </div>
          <div className="boxLight boxLight_off" style={{ display: light === "off" ? "block" : "none", left: lightLeft, top: lightTop }} ></div> 
          <div className="boxLight boxLight_red" style={{ display: light === "red" ? "block" : "none", left: lightLeft, top: lightTop }} ></div> 
          <div className="boxLight boxLight_green" style={{ display: light === "green" ? "block" : "none", left: lightLeft, top: lightTop }} ></div> 
        </div>
    </div>);
};

export default MainScreen;