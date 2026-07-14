const path = require("path");

// E2E uses the QA database but must keep APP_ENV local so the
// existing RATE_LIMIT_ENABLED=false test setting does not violate
// the production/qa runtime guard.
process.env.APP_ENV = "local";
process.env.QA_MODE = "true";
process.env.PORT = process.env.PORT || "3000";
process.env.HOSTNAME = process.env.HOSTNAME || "127.0.0.1";

process.argv = [
  process.argv[0],
  path.resolve(__dirname, "../../node_modules/next/dist/bin/next"),
  "start",
  "--hostname",
  process.env.HOSTNAME,
  "--port",
  process.env.PORT,
];

require(path.resolve(__dirname, "../../node_modules/next/dist/bin/next"));
