import React from 'react';
import {useState, useEffect, useRef, useContext } from 'react';
import { GlobalContext } from "./GlobalContext";
import './../assets/scss/app.scss';

import { DEFAULT_APP_SETTINGS, ESCAPP_CLIENT_SETTINGS, MAIN_SCREEN, MESSAGE_SCREEN } from '../constants/constants.jsx';
import MainScreen from './MainScreen.jsx';
import MessageScreen from './MessageScreen.jsx';

export default function App() {
  const { escapp, setEscapp, appSettings, setAppSettings, Storage, setStorage, Utils, I18n } = useContext(GlobalContext);
  const hasExecutedEscappValidation = useRef(false);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState(MAIN_SCREEN);
  const prevScreen = useRef(screen);
  const solution = useRef(null);
  const wrapperDiv = useRef(null);
  const [appWidth, setAppWidth] = useState(0);
  const [appHeight, setAppHeight] = useState(0);
  
  useEffect(() => {
    //Init Escapp client
    //Create the Escapp client instance.
    let escapp = new ESCAPP(ESCAPP_CLIENT_SETTINGS);
    setEscapp(escapp);
    Utils.log("Escapp client initiated with settings:", escapp.getSettings());

    //Use the storage feature provided by Escapp client.
    setStorage(escapp.getStorage());

    //Get app settings provided by the Escapp server.
    let _appSettings = processAppSettings(escapp.getAppSettings());
    setAppSettings(_appSettings);
    Utils.log("App settings:", _appSettings);

    //Init internacionalization module
    I18n.init(_appSettings);

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  function processAppSettings(_appSettings){
    if(typeof _appSettings !== "object"){
      _appSettings = {};
    }

    // Merge _appSettings with DEFAULT_APP_SETTINGS to obtain final app settings
    _appSettings = Utils.deepMerge(DEFAULT_APP_SETTINGS, _appSettings);

    const allowedActions = ["NONE", "SHOW_MESSAGE"];
    if(!allowedActions.includes(_appSettings.actionAfterSolve)) {
      _appSettings.actionAfterSolve = DEFAULT_APP_SETTINGS.actionAfterSolve;
    }

    return _appSettings;
  }

  useEffect(() => {
    if (!hasExecutedEscappValidation.current && escapp !== null && appSettings !== null && Storage !== null) {
      hasExecutedEscappValidation.current = true;

      //Register callbacks in Escapp client and validate user.
      escapp.registerCallback("onNewErStateCallback", function(erState){
        try {
          Utils.log("New escape room state received from ESCAPP", erState);
          restoreAppState(erState);
        } catch (e){
          Utils.log("Error in onNewErStateCallback", e);
        }
      });

      escapp.registerCallback("onErRestartCallback", function(erState){
        try {
          Utils.log("Escape Room has been restarted.", erState);
          if(typeof Storage !== "undefined"){
            Storage.removeSetting("state");
          }
        } catch (e){
          Utils.log("Error in onErRestartCallback", e);
        }
      });

      //Validate user. To be valid, a user must be authenticated and a participant of the escape room.
      escapp.validate((success, erState) => {
        try {
          Utils.log("ESCAPP validation", success, erState);
          if(success){
            restoreAppState(erState);
            setLoading(false);
          }
        } catch (e){
          Utils.log("Error in validate callback", e);
        }
      });
    }
  }, [escapp, appSettings, Storage]);

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

  function restoreAppState(erState){
    Utils.log("Restore application state based on escape room state:", erState);
    if (escapp.getAllPuzzlesSolved()){
      //Puzzle already solved
      if((appSettings.actionAfterSolve === "SHOW_MESSAGE")&&(screen !== MESSAGE_SCREEN)){
        setScreen(MESSAGE_SCREEN);
      }
    } else {
      //Puzzle not solved. Restore app state based on local storage.
      restoreAppStateFromLocalStorage();
    }
  }

  function restoreAppStateFromLocalStorage(){
    if(typeof Storage !== "undefined"){
      let stateToRestore = Storage.getSetting("state");
      if(stateToRestore){
        Utils.log("Restore app state", stateToRestore);
        setScreen(stateToRestore.screen);
        if(typeof stateToRestore.solution === "string"){
          solution.current = stateToRestore.solution;
        }
      }
    }
  }

  function saveAppState(){
    if(typeof Storage !== "undefined"){
      let currentAppState = {screen: screen};
      if(screen === MESSAGE_SCREEN){
        currentAppState.solution = solution.current;
      }
      Utils.log("Save app state in local storage", currentAppState);
      Storage.saveSetting("state",currentAppState);
    }
  }

  function onKeypadSolved(_solution){
    Utils.log("onKeypadSolved with solution:", _solution);
    if(typeof _solution !== "string"){
      return;
    }
    solution.current = _solution;

    switch(appSettings.actionAfterSolve){
      case "SHOW_MESSAGE":
        return setScreen(MESSAGE_SCREEN);
      case "NONE":
      default:
        return submitPuzzleSolution();
    }
  }

  function submitPuzzleSolution(){
    Utils.log("Submit puzzle solution", solution.current);

    escapp.submitNextPuzzle(solution.current, {}, (success) => {
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
        <MainScreen appHeight={appHeight} appWidth={appWidth} onKeypadSolved={onKeypadSolved} />
      );
    case MESSAGE_SCREEN:
      return renderScreen(
        <MessageScreen submitPuzzleSolution={submitPuzzleSolution} appHeight={appHeight} appWidth={appWidth} />
      );
    default:
      return renderScreen(screen);
  }
}