const chalk = require("chalk");

class OutputType {
  static INFORMATION = "INFORMATION";
  static SUCCESS = "SUCCESS";
  static WARNING = "WARNING";
  static ERROR = "INFORMATION";
}

const print = (mes, outputType) => {
  switch (outputType) {
    case OutputType.INFORMATION:
      console.log(chalk.white(mes));
      break;
    case OutputType.SUCCESS:
      console.log(chalk.green(mes));
      break;
    case OutputType.ERROR:
      console.log(chalk.red(mes));
      break;

    case OutputType.WARNING:
      console.log(chalk.yellow(mes));
      break;

    default:
      console.log(chalk.white(mes));
      break;
  }
};
module.exports = { print, OutputType };
