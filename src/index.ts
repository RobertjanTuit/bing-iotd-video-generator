import { Command } from "commander";
import { SlideShowOff } from "./slideshowoff";
const program = new Command();
import "./util/arrayExtensions";
import actions from "./actions";

new SlideShowOff(program, actions).execute();
