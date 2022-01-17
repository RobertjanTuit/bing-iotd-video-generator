import { ProgramOptions } from "../options/programOptions";
import { bingIotdFetchLatest } from "./bing-iotd-fetch-latest";

export interface IAction {
  isDefault?: boolean;
  execute(options: ProgramOptions): Promise<boolean>;
  command: string;
  description: string;
}

export default { bingIotdFetchLatest };
