import { Command, Option } from "commander";
import consola from "consola";
import "reflect-metadata";
import * as packageJSON from "../../package.json";
import { IAction } from "../actions";
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

function getOptions(options: ProgramOptions) {
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

export class ProgramOptions {
  version: any;
  title: any;
  constructor(private program: Command) {
    var optionsMetadata = getOptions(this);
    this.version = packageJSON["default"].version;
    this.title = packageJSON["default"].title;

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
  }

  public async actions(actions: any) {
    const actionObjects: IAction[] = Object.keys(actions).map(
      (key: string | number) => new actions[key]() as IAction
    );
    this.program
      .command("default", {
        isDefault: true,
        hidden: true,
      })
      .action((name, options, command) => {
        inquirer
          .prompt([
            {
              type: "list",
              name: "action",
              message: "Select an action to execute",
              choices: actionObjects.map((ao) => ao.command),
            },
          ])
          .then((answers) => {
            var ao = actionObjects
              .filter((ao) => ao.command == answers.action)
              .mapAsync<boolean>(async (ao) => await ao.execute(this));
          });
      });

    actionObjects.forEach((action) => {
      this.program
        .command(action.command, action.description)
        .action((name, options, command) => {
          action.execute(this);
        });
    });

    var parsedOptions = this.program.parse().opts();
    for (const key in parsedOptions) {
      const value = parsedOptions[key];
      this[key] = value;
    }
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
