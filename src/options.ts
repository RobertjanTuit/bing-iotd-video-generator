import { Command, Option } from "commander";
import consola from "consola";
import "reflect-metadata";
import * as packageJSON from "../package.json";
import { IAction } from "./actions";
import inquirer from "inquirer";

enum optionTypes {
  choices,
  boolean,
  string,
  array,
}

const decorators = {
  option: "option",
};

interface IOptionprops {
  group?: string;
  type: optionTypes;
  flags: string[];
  description: string;
  required?: boolean;
  choices?: any[];
}

function option(props: IOptionprops) {
  return Reflect.metadata(decorators.option, props);
}

function getOptions(options: Options) {
  return Object.keys(options)
    .map((key) => ({
      key: key,
      props: Reflect.getMetadata(
        decorators.option,
        options,
        key
      ) as IOptionprops,
    }))
    .filter((k) => k.props != null);
}

export class Options {
  version: any;
  constructor(private program: Command) {
    var optionsMetadata = getOptions(this);
    this.version = packageJSON["default"].version;

    optionsMetadata.forEach(({ key, props }) => {
      var option = new Option(props.flags.join(", "), props.description);
      if (this[key]) {
        option.default(this[key]);
      }

      if (props.required) {
        option.required;
      }

      program.addOption(option);
    });

    program.version(this.version);

    var parsedOptions = program.parse().opts();
    for (const key in parsedOptions) {
      const value = parsedOptions[key];
      this[key] = value;
    }
  }

  public async actions(actions: any) {
    this.program
      .command("help", { isDefault: true, hidden: true })
      .action(() => {
        inquirer
          .prompt([
            {
              type: "list",
              name: "action",
              message: "Select an action to execute",
              choices: actions,
            },
          ])
          .then((answers) => {
            consola.log(answers);
          });
      });

    Object.keys(actions).forEach((key) => {
      var action = new actions[key]() as IAction;
      this.program.command(action.command, action.description).action(() => {
        action.execute(this);
      });
    });
  }

  @option({
    type: optionTypes.boolean,
    flags: ["-w", "--watch"],
    description: "watch for changes in source and config and re-execute.",
  })
  public watch: boolean = false;
  @option({
    type: optionTypes.string,
    flags: ["-bu", "--baseUrl"],
    description: "Bing base url",
  })
  public baseUrl: string = "https://www.bing.com/";

  @option({
    type: optionTypes.string,
    flags: ["-if", "--imageFolder"],
    description: "Folder to output images",
  })
  public imageFolder: string = "./output/images/";

  @option({
    type: optionTypes.string,
    flags: ["-cd", "--cacheFolder"],
    description: "Folder use for disk cache",
  })
  public cacheFolder = "./output/_cache/";

  @option({
    type: optionTypes.string,
    flags: ["-fuf", "--feedUrlFormat"],
    description: "Format for the feed url path",
  })
  public feedUrlFormat =
    "HPImageArchive.aspx?format=js&idx={start}&n={count}&mkt={locale}";

  @option({
    type: optionTypes.array,
    flags: ["-l", "--locales <locale...>"],
    description: "List of locales to use as image sources",
  })
  public locales = [
    "en-US",
    "en-GB",
    "en-AU",
    "de-DE",
    "ja-JP",
    "nl-NL",
    "zh-CN",
    "ru-RU",
  ];
}
