import React from 'react';
import {useState, useEffect, useRef, useContext } from 'react';
import { GlobalContext } from "./GlobalContext";
import './../assets/scss/app.scss';

import { ESCAPP_CLIENT_SETTINGS, MAIN_SCREEN, MESSAGE_SCREEN } from '../constants/constants.jsx';
import MainScreen from './MainScreen.jsx';
import MessageScreen from './MessageScreen.jsx';

let escapp;
let escappClientSettings;
let appSettings;
let Storage;
const allowedActions = ["NONE", "SHOW_MESSAGE"];
let actionAfterSolve = allowedActions[0]; //Default action

export default function App() {
  const { setEscapp, Utils, I18n } = useContext(GlobalContext);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState(MAIN_SCREEN);
  const prevScreen = useRef(screen);
  const [solution, setSolution] = useState("");
  const wrapperDiv = useRef(null);
  const [appWidth, setAppWidth] = useState(0);
  const [appHeight, setAppHeight] = useState(0);
  
  useEffect(() => {
    //Specify callbacks for Escapp client
    ESCAPP_CLIENT_SETTINGS.onNewErStateCallback = (erState) => {
      try {
        Utils.log("New escape room state received from ESCAPP", erState);
        restoreERState(erState);
      } catch (e){
        Utils.log("Error in onNewErStateCallback", e);
      }
    }
    ESCAPP_CLIENT_SETTINGS.onErRestartCallback = (erState) => {
      try {
        Utils.log("Escape Room has been restarted.", erState);
        if(typeof Storage !== "undefined"){
          Storage.removeSetting("state");
        }
      } catch (e){
        Utils.log("Error in onErRestartCallback", e);
      }
    };

    //Create the Escapp client instance.
    escapp = new ESCAPP(ESCAPP_CLIENT_SETTINGS);
    setEscapp(escapp);
    escappClientSettings = escapp.getSettings();
    //Get app settings provided by the Escapp server.
    appSettings = escapp.getAppSettings();
    //Use the storage feature provided by Escapp client.
    Storage = escapp.getStorage();
    Utils.log("Escapp client initiated with settings:", escappClientSettings);
    Utils.log("appSettings", appSettings);

    if((typeof appSettings === "object")&&(allowedActions.includes(appSettings.actionAfterSolve))) {
      actionAfterSolve = appSettings.actionAfterSolve;
    }

    //Init internacionalization module
    I18n.init(appSettings);
    
    //Validate user. To be valid, a user must be authenticated and a participant of the escape room.
    escapp.validate((success, erState) => {
      try {
        Utils.log("ESCAPP validation", success, erState);
        if(success){
          restoreERState(erState);
          setLoading(false);
        }
      } catch (e){
        Utils.log("Error in validate callback", e);
      }
    });

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    handleResize();
  }, [loading]);

  useEffect(() => {
    if (screen !== prevScreen.current) {
      Utils.log("Screen ha cambiado de", prevScreen.current, "a", screen);
      prevScreen.current = screen;
      saveAppState();
    }
  }, [screen]);

  function handleResize(){
    let wrapper = wrapperDiv.current;
    if(wrapper){
      setAppWidth(wrapper.offsetWidth);
      setAppHeight(wrapper.offsetHeight);
    }
  }

  function restoreERState(erState){
    Utils.log("Restore escape room state", erState);
    if (escapp.getAllPuzzlesSolved()){
      //Puzzle already solved
      if(actionAfterSolve === "SHOW_MESSAGE"){
        setScreen(MESSAGE_SCREEN);
      }
    } else {
      //Puzzle not solved. Restore app state based on local storage.
      restoreAppState();
    }
  }

  function saveAppState(){
    if(typeof Storage !== "undefined"){
      let currentAppState = {screen: screen};
      if(screen === MESSAGE_SCREEN){
        currentAppState.solution = solution;
      }
      Utils.log("Save app state in local storage", currentAppState);
      Storage.saveSetting("state",currentAppState);
    }
  }

  function restoreAppState(){
    if(typeof Storage !== "undefined"){
      let stateToRestore = Storage.getSetting("state");
      if(stateToRestore){
        Utils.log("Restore app state", stateToRestore);
        setScreen(stateToRestore.screen);
        if(typeof stateToRestore.solution === "string"){
          setSolution(stateToRestore.solution);
        }
      }
    }
  }

  function onKeypadSolved(solution){
    Utils.log("onKeypadSolved with solution:", solution);
    if(typeof solution !== "string"){
      return;
    }
    setSolution(solution);

    const allowedActions = ["NONE", "SHOW_MESSAGE"];
    let actionAfterSolve = allowedActions[0]; //Default action

    if((typeof appSettings === "object")&&(allowedActions.includes(appSettings.actionAfterSolve))) {
      actionAfterSolve = appSettings.actionAfterSolve;
    }

    switch(actionAfterSolve){
      case "SHOW_MESSAGE":
        return setScreen(MESSAGE_SCREEN);
      case "NONE":
      default:
        return solvePuzzle();
    }
  }

  function submitPuzzleSolution(){
    Utils.log("Submit puzzle solution", solution);

    escapp.submitNextPuzzle(solution, {}, (success) => {
      if(!success){
        setScreen(MAIN_SCREEN);
      }
      Utils.log("Solution submitted to Escapp", success);
    });
  }

  if(loading){
      return "";
  }

  const renderScreen = (content) => (
    <div id="wrapper" ref={wrapperDiv}>
      {content}
    </div>
  );

  switch(screen){
    case MAIN_SCREEN:
      return renderScreen(
        <MainScreen onKeypadSolved={onKeypadSolved} appHeight={appHeight} appWidth={appWidth} />
      );
    case MESSAGE_SCREEN:
      return renderScreen(
        <MessageScreen submitPuzzleSolution={submitPuzzleSolution} appHeight={appHeight} appWidth={appWidth} />
      );
    default:
      return renderScreen(screen);
  }
}