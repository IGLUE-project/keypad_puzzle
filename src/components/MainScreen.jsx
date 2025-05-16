import React, { useState, useEffect } from 'react';
import BoxButton from './BoxButton.jsx';
import './../assets/scss/main.scss';

const MainScreen = (props) => {
  const [password, setPassword] = useState([]);
  const [processingClick, setProcessingClick] = useState(false);
  const [checking, setChecking] = useState(false);
  const [light, setLight] = useState("off");
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerMarginLeft, setContainerMarginLeft] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);
  const [boxHeight, setBoxHeight] = useState(0);
  const [lightLeft, setLightLeft] = useState(0);
  const [lightTop, setLightTop] = useState(0);

  const onClickButton = (value) => {
    console.log("onClickButton", value);
    if (processingClick || checking) {
      return;
    }
    setProcessingClick(true);

    if (password.length < props.config.passwordLength) {
      setPassword((prevPassword) => [...prevPassword, value]);
    }

    const shortBeep = document.getElementById("audio_beep");

    setTimeout(() => {
      if (password.length + 1 === props.config.passwordLength) {
        setChecking(true);
        setProcessingClick(false);

        const solution = [...password, value].join("");
        setPassword([]);
        console.log("Checking solution", solution);
        //check solution here, to see if change box light to green or red
        props.escapp.checkPuzzle(props.config.escapp.puzzleId, solution, {}, (success) => {
          changeboxLight(success, solution);
        });
      } else {
        setProcessingClick(false);
      }
    }, 300);

    shortBeep.pause();
    shortBeep.currentTime = 0;
    shortBeep.play();
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
      afterChangeboxLight(success, solution);
    }, 1000);

    audio.play();
  }

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

  useEffect(() => {
    handleResize();
  }, [props.appWidth, props.appHeight]);

  const afterChangeBoxLight = (success, solution) => {
    if (success) {
      return props.onTryBoxOpen(solution);
    }
    setChecking(false);
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