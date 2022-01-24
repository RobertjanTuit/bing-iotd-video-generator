import { build } from "./tasks/build.index.js";
import { clean } from "./tasks/clean.js";

await clean();
await build();
