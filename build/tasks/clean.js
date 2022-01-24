import { promisify } from "util";
import rimraf from "rimraf";

export async function clean() {
  await promisify(rimraf)("./output/");
}
