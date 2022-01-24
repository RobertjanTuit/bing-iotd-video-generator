import { watch } from "./tasks/watch.js";
import { build } from "./tasks/build.index.js";
import { serve } from "./tasks/serve.js";
import { clean } from "./tasks/clean";

await clean();
var stopFn = await watch(build);
await serve("output", true);
