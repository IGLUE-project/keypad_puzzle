//Copy this file to config.js and specify your own settings

export let ESCAPP_APP_SETTINGS = {
  //Settings that can be specified by the authors
  skin: "STANDARD", //skin can be "STANDARD", "RETRO", "RETRO_JUNGLE", "RETRO_REALISTIC" or "FUTURISTIC".
  //background: "NONE", //background can be "NONE" or a URL.
  actionAfterSolve: "SHOW_MESSAGE", //actionAfterSolve can be "NONE" or "SHOW_MESSAGE".
  //message: "Custom message",
  keysType: "NUMBERS", //keys can be "NUMBERS", "LETTERS", "COLORS" or "SYMBOLS".

  //Settings that will be automatically specified by the Escapp server
  //solutionLength: 4, In standalone apps, this setting should be specified in constants.jsx
  locale:"es",

  escappClientSettings: {
    endpoint:"https://escapp.es/api/escapeRooms/id",
    //linkedPuzzleIds: [1], In standalone apps, this setting should be specified in constants.jsx
    rtc: false,
    preview: false
  },
};