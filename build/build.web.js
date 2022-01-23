import { promisify } from "util";
import rimraf from "rimraf";

import { watch } from "./tasks/watch.js";
import { build } from "./tasks/build.js";
import { serve } from "./tasks/serve.js";

await promisify(rimraf)("./output/");
var stopFn = await watch(build);
await serve("output", true);
