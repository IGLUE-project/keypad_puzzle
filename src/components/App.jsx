import React from 'react';
import {useState, useEffect, useRef} from 'react';
import './../assets/scss/app.scss';

import * as Utils from '../vendors/Utils.js';
import * as I18n from '../vendors/I18n.js';

import { ESCAPP_CLIENT_SETTINGS, MAIN_SCREEN, SUCCESS_SCREEN } from '../constants/constants.jsx';
import MainScreen from './MainScreen.jsx';

let escapp;
let escappClientSettings;
let appSettings;
let Storage;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState(MAIN_SCREEN);
  const [solution, setSolution] = useState("");
  const wrapperDiv = useRef(null);
  const [appWidth, setAppWidth] = useState(0);
  const [appHeight, setAppHeight] = useState(0);
  
  useEffect(() => {
    //Specify callbacks for Escapp client
    ESCAPP_CLIENT_SETTINGS.onNewErStateCallback = (erState) => {
      Utils.log("New escape room state received from ESCAPP", erState);
      //restoreState(erState);
    }
    ESCAPP_CLIENT_SETTINGS.onErRestartCallback = (erState) => {
      Utils.log("Escape Room has been restarted.", erState);
      if(typeof Storage.removeSetting === "function"){
        Storage.removeSetting("state");
      }
    };

    //Create the Escapp client instance.
    escapp = new ESCAPP(ESCAPP_CLIENT_SETTINGS);
    escappClientSettings = escapp.getSettings();
    //Get app settings provided by the Escapp server.
    appSettings = escapp.getAppSettings();
    //Use the storage feature provided by Escapp client.
    Storage = escapp.getStorage();
    Utils.log("Escapp client initiated with settings:", escappClientSettings);
    Utils.log("appSettings", appSettings);

    //Init internacionalization module
    I18n.init(appSettings);
    
    //Validate user. To be valid, a user must be authenticated and a participant of the escape room.
    escapp.validate((success, erState) => {
      Utils.log("ESCAPP validation", success, erState);
      try { 
        if(success){
          //restoreState(erState);
        }
      } catch(e){
        console.error(e);
      }
    });

    window.addEventListener('resize', handleResize);
    setLoading(false);

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    handleResize();
  }, [loading]);

  useEffect(() => {
    handleResize();
  }, [screen]);

  function handleResize(){
    let wrapper = wrapperDiv.current;
    if(wrapper){
      setAppWidth(wrapper.offsetWidth);
      setAppHeight(wrapper.offsetHeight);
    }
  }

/*  function solvePuzzle(){
    //XXX DUDA: a este método solo se le llama cuando sale el boton continue, que es cuando se han resuelto todos los puzzles
    console.log("Solving puzzle", solution);

    //XXX DUDA: en el de MalditaER se guarda en localstorage con la clave "safebox_password", quizá sirva por si se vuelve a recargar o se vuelve a la app, que el estado se pierde.
    //lo mejor seria guardar en localstorage todo el estado de la app cuando algo cambia y asi al volver a cargar la app se restaura el estado en el useEffect

    escapp.submitPuzzle(GLOBAL_CONFIG.escapp.puzzleId, solution, {}, (success) => {
      if(!success){
        onOpenScreen(KEYPAD_SCREEN);
      }
    });
  }

  */

/*  function restoreState(erState){
    console.log("Restoring state", erState);
    if((typeof erState !== "undefined") && (erState.puzzlesSolved.length > 0)){
      let lastPuzzleSolved = Math.max.apply(null, erState.puzzlesSolved);      
      if (lastPuzzleSolved >= GLOBAL_CONFIG.escapp.puzzleId) {
        //puzzle superado, abrimos la caja fuerte     
        // setScreen(SAFE_OPEN_SCREEN);
        // setPrevScreen(PAINTING_SCREEN);
      } else {
        //puzzle no superado, miramos en localStorage en qué pantalla estábamos
        let localstateToRestore = LocalStorage.getSetting("app_state");
        console.log("Restoring screen from local state", localstateToRestore);
        if(localstateToRestore){      
          // setScreen(localstateToRestore.screen);
          // setPrevScreen(localstateToRestore.prevScreen);
        }
      }
      setLoading(false);
    } else {
      restoreLocalState();
    }
  }*/

/*  function saveState(){
    console.log("Saving state to local storage");
    let currentState = {screen: screen, prevScreen: prevScreen};
    LocalStorage.saveSetting("app_state", currentState);
  }*/

/*  function restoreLocalState(){
    let stateToRestore = LocalStorage.getSetting("app_state");
    console.log("Restoring local state", stateToRestore);
    if(stateToRestore){      
      // setScreen(stateToRestore.screen);
      // setPrevScreen(stateToRestore.prevScreen);
      setLoading(false);
    }
  }*/

  function onTryBoxOpen(sol){
/*    console.log("onTryBoxopen with solution:", sol);
    if(typeof solution !== "string"){
      return;
    }
    setSolution(sol);
    escapp.checkPuzzle(GLOBAL_CONFIG.escapp.puzzleId, sol, {}, (success, erState) => {
      if(success){
        //onOpenScreen(SAFE_OPEN_SCREEN);    
      }
      return success;
    });*/
  }

/*
  function onOpenScreen(newscreen_name){
    console.log("Opening screen", newscreen_name);
    setPrevScreen(screen);
    setScreen(newscreen_name);
    saveState();
  }*/

  
  if(loading){
      return "";
  }

  switch(screen){
    case MAIN_SCREEN:
      return (<div id="wrapper" ref={wrapperDiv}>
        <MainScreen escapp={escapp} I18n={I18n} onTryBoxOpen={onTryBoxOpen} appHeight={appHeight} appWidth={appWidth} />
      </div>);
    case SUCCESS_SCREEN:
    default:
      return screen;
  }
}