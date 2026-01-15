// state.js
let currentPlayer = null;
let currentShip = null;
let currentSystemObjects = [];

export function getCurrentPlayer() { return currentPlayer; }
export function setCurrentPlayer(p) { currentPlayer = p; }

export function getCurrentShip() { return currentShip; }
export function setCurrentShip(s) { currentShip = s; }

export function getCurrentSystemObjects() { return currentSystemObjects; }
export function setCurrentSystemObjects(arr) { currentSystemObjects = Array.isArray(arr) ? arr : []; }
