import React from 'react';
import {useState, useEffect} from 'react';
import './../assets/scss/app.scss';
import './../assets/scss/modal.scss';

import {GLOBAL_CONFIG} from '../config/config.js';
import * as I18n from '../vendors/I18n.js';
import * as LocalStorage from '../vendors/Storage.js';

import MainScreen from './MainScreen.jsx';
import PaintingScreen from './PaintingScreen.jsx';
import SafeClosedScreen from './SafeClosedScreen.jsx';
import SafeOpenScreen from './SafeOpenScreen.jsx';
let escapp;

import { SCREENS, PAINTING_SCREEN, SAFE_CLOSED_SCREEN, KEYPAD_SCREEN, SAFE_OPEN_SCREEN } from '../constants/constants.jsx';


export default function App() {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState(PAINTING_SCREEN);
  const [prevScreen, setPrevScreen] = useState(PAINTING_SCREEN);
  //para recordar qué puzzle es este, por si se restaura el estado de escapp, saber si se ha superado este o no
  const [puzzle, setPuzzle] = useState(0);

  useEffect(() => {
    console.log("useEffect, lets load everything");
    //localStorage.clear();
    I18n.init(GLOBAL_CONFIG);
    LocalStorage.init(GLOBAL_CONFIG.localStorageKey);
    GLOBAL_CONFIG.escapp.onNewErStateCallback = (er_state) => {
      console.log("New ER state received from ESCAPP", er_state);
      restoreState(er_state);
    }
    GLOBAL_CONFIG.escapp.onErRestartCallback = (er_state) => {
      // reset(); //For development
      console.log("Escape Room Restart received from ESCAPP", er_state);
      LocalStorage.removeSetting("app_state");
      LocalStorage.removeSetting("played_door");
    };
    escapp = new ESCAPP(GLOBAL_CONFIG.escapp);
    escapp.validate((success, er_state) => {
      console.log("ESCAPP validation", success, er_state);
      try { 
        if(success){
          //ha ido bien, restauramos el estado recibido
          restoreState(er_state);
        }
      } catch(e){
        console.error(e);
      }
    });
    window.addEventListener('resize', handleResize);
    handleResize();
    setLoading(false);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);  

  useEffect(() => {
    console.log("useEffect, screen changed");
    if (prevScreen === KEYPAD_SCREEN && screen === SAFE_CLOSED_SCREEN) {
      setTimeout(() => onOpenScreen(SAFE_OPEN_SCREEN), 2000);
    }
    if (prevScreen !== screen) {
      handleResize();
    }
  }, [screen]);


  function solvePuzzle(){
    const solution = LocalStorage.getSetting("safebox_password");
    console.log("Solving puzzle", solution);

    escapp.submitPuzzle(GLOBAL_CONFIG.escapp.puzzleId, solution, {}, (success) => {
      if(!success){
        onOpenScreen(KEYPAD_SCREEN);
      }
    });
  }

  function reset(){
    escapp.reset();
    localStorage.clear();
  }

  function restoreState(er_state){
    console.log("Restoring state", er_state);
    if((typeof er_state !== "undefined") && (er_state.puzzlesSolved.length > 0)){
      let lastPuzzleSolved = Math.max.apply(null, er_state.puzzlesSolved);
      if (er_state.puzzlesSolved.length == 7 && screen == PAINTING_SCREEN) {
        setLoading(false);
        setPuzzle(lastPuzzleSolved);
        setScreen(SAFE_OPEN_SCREEN);
        setPrevScreen(PAINTING_SCREEN);
      } else {
        if (screen == PAINTING_SCREEN) {
          setLoading(false);
          setPuzzle(lastPuzzleSolved);
          setScreen(SAFE_OPEN_SCREEN);
          setPrevScreen(PAINTING_SCREEN);
        } else {
          forceUpdate();
        }
      }
    } else {
      setLoading(false);
      restoreLocalState();
    }
  }

  function saveState(){
    console.log("Saving state to local storage");
    let currentState = {screen: screen, puzzle: puzzle, prevScreen: prevScreen};
    LocalStorage.saveSetting("app_state", currentState);
  }

  function restoreLocalState(){
    let stateToRestore = LocalStorage.getSetting("app_state");
    console.log("Restoring local state", stateToRestore);
    if(stateToRestore){
      setLoading(false);
      setScreen(stateToRestore.screen);
      setPrevScreen(stateToRestore.prevScreen);
      setPuzzle(stateToRestore.puzzle);
    }
  }

  function onBoxOpen(solution){
    console.log("Box open", solution);
    if(typeof solution !== "string"){
      return;
    }
    escapp.checkPuzzle(GLOBAL_CONFIG.escapp.puzzleId, solution, {}, (success, er_state) => {
      if(success){
        onPuzzleCompleted(GLOBAL_CONFIG.escapp.puzzleId);
        LocalStorage.saveSetting("safebox_password", solution);
      }
    });
  }

  function onPuzzleCompleted(puzzle_id){
    console.log("Puzzle completed", puzzle_id);
    setPuzzle(puzzle_id);    
    setScreen(SAFE_OPEN_SCREEN);
    setPrevScreen(KEYPAD_SCREEN);
    saveState();
  }

  function onOpenScreen(newscreen_name){
    console.log("Opening screen", newscreen_name);
    setPrevScreen(screen);
    setScreen(newscreen_name);
    saveState();
  }

  function handleResize(){
    let contentHeight = $("#root").height();
    let contentWidth = $("#root").width();
    let aspectRatio = 4 / 3;
    let boxWidth = Math.min(contentHeight * aspectRatio, contentWidth);
    let boxHeight = boxWidth / aspectRatio;

    let buttonContainer = $("div#container");
    $(buttonContainer).width(boxWidth * 0.22);
    $(buttonContainer).css("margin-left", boxWidth / 2 * 0.09);
    // $(buttonContainer).css("margin-top",boxHeight*0.3 + (contentHeight-boxHeight)/2);
    $(buttonContainer).height(boxHeight * 0.4);

    $("div.boxButton").width(boxWidth * 0.06);
    $("div.boxButton").height(boxHeight * 0.1);

    let boxLight = $("div.boxlight");
    $(boxLight).css('left', $("#root").width() / 2 + boxWidth / 2 * 0.3);
    $(boxLight).css('top', $("#root").height() / 2 - boxHeight / 2 * 0.4);
  }

  
  if(loading){
      return "Loading...";
  }
  let puzzlesSolved = [];
  let solvedAllPuzzles = false;
  if(!escapp){
    setLoading(true);
  } else {
    let newestState = escapp.getNewestState();
    puzzlesSolved = (newestState && newestState.puzzlesSolved) ? newestState.puzzlesSolved : [];
    solvedAllPuzzles = true; //newestState.puzzlesSolved.length >= 7;
  }
  return (<div>
    <PaintingScreen show={screen === "painting"} key="PaintingScreen" I18n={I18n} onOpenScreen={onOpenScreen} />
    <SafeClosedScreen show={screen === "safe_closed"} key="SafeClosedScreen" I18n={I18n} onOpenScreen={onOpenScreen} />
    <MainScreen show={screen === "keypad"} key="MainScreen" config={GLOBAL_CONFIG} I18n={I18n} escapp={escapp} onBoxOpen={onBoxOpen} />
    <SafeOpenScreen show={screen === "safe_open"} key="SafeOpenScreen" I18n={I18n} solvedAllPuzzles={solvedAllPuzzles} solvePuzzle={solvePuzzle}/>
  </div>);
}
