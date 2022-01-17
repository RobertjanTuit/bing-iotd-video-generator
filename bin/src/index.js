import consola from "consola";
import { Command } from "commander";
import { Options } from "./options";
const program = new Command();
import gradient from "gradient-string";
import "./util/forEachAsync";
import actions from "./actions";
var options = new Options(program);
consola.log(`Welcome to ${gradient(["#f26522", "#8dc63f", "#00aeef", "#ffc20e"])("-=<[ Bing Image-Of-The-Day Video Generator ]>=-")} ${options.version}`);
await options.actions(actions);
//# sourceMappingURL=index.js.map