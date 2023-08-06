const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
import routes from "./routes";

const app = express();
const port = 3001;

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Create an HTTP server for Express
app.listen(port, () => {
  console.log(`Express server listening on http://localhost:${port}`);
});

app.use("/api/windows-manager", routes.windows);
