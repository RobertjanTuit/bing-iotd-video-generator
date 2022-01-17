import consola from "consola";
import { Command } from "commander";
import { ProgramOptions } from "./options/programOptions";
const program = new Command();
import gradient from "gradient-string";
import "./util/forEachAsync";
import actions from "./actions";

var programOptions = new ProgramOptions(program);

consola.log(
  `Welcome to ${gradient(["#f26522", "#8dc63f", "#00aeef", "#ffc20e"])(
    `-=<[ ${programOptions.title} v${programOptions.version} ]>=-`
  )}`
);

await programOptions.actions(actions);
