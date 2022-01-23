import TscWatchClient from "tsc-watch/client";

const watch = new TscWatchClient();
var args = process.argv;

var startCommand = `yarn start`;
var argOptions = args.filter((option) => option.startsWith("-"));
if (argOptions.length) {
  startCommand += " " + args.slice(args.indexOf(argOptions[0])).join(" ");
}
watch.start("--onSuccess", startCommand);
