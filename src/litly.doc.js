const Processor = require("./processor/processor");

/**
 * @author Maikon Ferreira <me@maikonferreira.tech>
 */

// @Litly Class
module.exports = class Litly {
  static init = (express, appName) => {
    new Processor().process(express, appName);

    express.set("views", __dirname + "/views");
    express.set("view engine", "ejs");
  };
};
