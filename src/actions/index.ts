import { Options } from "../options";
import { bingIotdFetchLatest } from "./bing-iotd-fetch-latest";

export interface IAction {
  isDefault?: boolean;
  execute(options: Options): Promise<boolean>;
  command: string;
  description: string;
}

export default { bingIotdFetchLatest };
