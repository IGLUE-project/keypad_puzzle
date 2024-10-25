import React, { useState, useEffect } from 'react';
import BoxButton from './BoxButton.jsx';
import './../assets/scss/main.scss';

const MainScreen = (props) => {
  const [password, setPassword] = useState([]);
  const [processingClick, setProcessingClick] = useState(false);
  const [checking, setChecking] = useState(false);
  const [light, setLight] = useState("off");

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
          changeBoxLight(success, solution);
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
      afterChangeBoxLight(success, solution);
    }, 1000);

    audio.play();
  }

  const afterChangeBoxLight = (success, solution) => {
    if (success) {
      return props.onTryBoxOpen(solution);
    }
    setChecking(false);
  };

  return (<div id="screen_main" className={"screen_wrapper" + (props.show ? "" : " screen_hidden")}>
      {props.show ? (<div id="container">
          <audio id="audio_beep" src="sounds/beep-short.mp3" autostart="false" preload="auto" />
          <audio id="audio_failure" src="sounds/access-denied.mp3" autostart="false" preload="auto" />
          <audio id="audio_success" src="sounds/correct.mp3" autostart="false" preload="auto" />
          <div id="row1" className="row">
            <BoxButton value={"1"} position={1} onClick={onClickButton} />
            <BoxButton value={"2"} position={2} onClick={onClickButton} />
            <BoxButton value={"3"} position={3} onClick={onClickButton} />
          </div>
          <div id="row2" className="row">
            <BoxButton value={"4"} position={4} onClick={onClickButton} />
            <BoxButton value={"5"} position={5} onClick={onClickButton} />
            <BoxButton value={"6"} position={6} onClick={onClickButton} />
          </div>
          <div id="row3" className="row">
            <BoxButton value={"7"} position={7} onClick={onClickButton} />
            <BoxButton value={"8"} position={8} onClick={onClickButton} />
            <BoxButton value={"9"} position={9} onClick={onClickButton} />
          </div>
          <div id="row4" className="row">
            <BoxButton value={"*"} position={10} onClick={onClickButton} />
            <BoxButton value={"0"} position={11} onClick={onClickButton} />
            <BoxButton value={"#"} position={12} onClick={onClickButton} />
          </div>
          <div className="boxlight boxlight_off" style={{ display: light === "off" ? "block" : "none" }} ></div>
          <div className="boxlight boxlight_red" style={{ display: light === "red" ? "block" : "none" }} ></div>
          <div className="boxlight boxlight_green" style={{ display: light === "green" ? "block" : "none" }} ></div>
        </div>) : null}
    </div>);
};

export default MainScreen;
