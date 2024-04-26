import { CURRENT_RESOURCE_NAME } from "../config";
import { getArg, isEmpty } from "../utils";
import { Args } from "../types";

const COMMAND_DEBUG = `${CURRENT_RESOURCE_NAME}:debug`;

function shouldDebug() {
  return !!GetConvarInt(COMMAND_DEBUG, 0);
}

function labeledLog(...data: any[]) {
  console.log(`${CURRENT_RESOURCE_NAME.toUpperCase()}:`, ...data);
}

function startDebug() {
  ExecuteCommand(`set ${COMMAND_DEBUG} 1`);
  labeledLog("debug on");
}

function stopDebug() {
  ExecuteCommand(`set ${COMMAND_DEBUG} 0`);
  labeledLog("debug off");
}

function toggleDebug() {
  if (shouldDebug()) return stopDebug();
  return startDebug();
}

function isValidInt(num: number) {
  return num === 0 || num === 1;
}

function handleDebug(arg: string) {
  const num = parseInt(arg);
  if (!isValidInt(num)) return;
  if (!!num) return startDebug();
  stopDebug();
}

export function debug(_source: number, args: Args | []) {
  if (isEmpty(args)) return toggleDebug();
  const arg = getArg(args);
  handleDebug(arg);
}

/**
 * A simple debug print function that is dependent on a convar
 * will output a nice prettfied message if debug is on
 */
export function debugPrint(...data: any[]) {
  if (!shouldDebug()) return;
  labeledLog(...data);
}

RegisterCommand(COMMAND_DEBUG, debug, false);
