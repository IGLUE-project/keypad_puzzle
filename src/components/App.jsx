import React from 'react';
import {useState, useEffect, useRef} from 'react';
import './../assets/scss/app.scss';

import { ESCAPP_CLIENT_SETTINGS, MAIN_SCREEN, SUCCESS_SCREEN } from '../constants/constants.jsx';
import * as I18n from '../vendors/I18n.js';
import * as LocalStorage from '../vendors/Storage.js';
import MainScreen from './MainScreen.jsx';

let escapp;
let escappClientSettings;
let reusablePuzzleSettings;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState(MAIN_SCREEN);
  const [solution, setSolution] = useState("");
  const wrapperDiv = useRef(null);
  const [appWidth, setAppWidth] = useState(0);
  const [appHeight, setAppHeight] = useState(0);
  
  useEffect(() => {
    escapp = new ESCAPP(ESCAPP_CLIENT_SETTINGS);
    escappClientSettings = escapp.getSettings();
    reusablePuzzleSettings = escapp.getReusablePuzzleSettings();
    console.log("Escapp client initiated with settings:",escappClientSettings);
    console.log("reusablePuzzleSettings",reusablePuzzleSettings);

    //escapp.displayCustomEscappDialog("Escapp client loaded","Escapp client loaded");
    
    //localStorage.clear();  //For development
    //I18n.init(GLOBAL_CONFIG);
    //LocalStorage.init(GLOBAL_CONFIG.localStorageKey);
    
    ESCAPP_CLIENT_SETTINGS.onNewErStateCallback = (er_state) => {
      console.log("New ER state received from ESCAPP", er_state);
      //restoreState(er_state);
    }
    ESCAPP_CLIENT_SETTINGS.onErRestartCallback = (er_state) => {
      // reset(); //For development
      console.log("Escape Room restart received from ESCAPP", er_state);
      //LocalStorage.removeSetting("app_state");
    };
    escapp.validate((success, er_state) => {
      console.log("ESCAPP validation", success, er_state);
      try { 
        if(success){
          //restoreState(er_state);
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

  function reset(){
    escapp.reset();
    localStorage.clear();
  }*/

/*  function restoreState(er_state){
    console.log("Restoring state", er_state);
    if((typeof er_state !== "undefined") && (er_state.puzzlesSolved.length > 0)){
      let lastPuzzleSolved = Math.max.apply(null, er_state.puzzlesSolved);      
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
    escapp.checkPuzzle(GLOBAL_CONFIG.escapp.puzzleId, sol, {}, (success, er_state) => {
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