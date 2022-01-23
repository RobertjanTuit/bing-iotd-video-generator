import { SlideShowOff } from "../slideshowoff";
import { bingIotdFetchLatest } from "./bing-iotd-fetch-latest";

export interface IAction {
  isDefault?: boolean;
  execute(options: SlideShowOff): Promise<boolean>;
  command: string;
  description: string;
}

export default { bingIotdFetchLatest };
