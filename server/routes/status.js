const basicAuth = require("express-basic-auth");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Validator } = require("express-json-validator-middleware");

const Router = express.Router();
const dpSecret = process.env.dpSecret || "supersecret";

const statusSchema = {
  type: "array",
  items: {
    type: "object",
    properties: {
      dpInstance: { type: "string" },
      State: { type: "string" },
      Version: { type: "string" },
      MachineType: { type: "string" },
      Domains: { type: "array", items: [{ type: "string" }] },
      uptime: { type: "string" },
      bootuptime2: { type: "string" },
    },
    required: [
      "dpInstance",
      "State",
      "Version",
      "MachineType",
      "Domains",
      "uptime",
      "bootuptime2",
    ],
    additionalProperties: false,
  },
};

const { validate } = new Validator();

var RateLimit = require("express-rate-limit");
var limiter = new RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50,
});

// apply rate limiter to all requests
Router.use(limiter);
Router.get("/status", function (req, res) {
  fs.readFile(path.join("/tmp", "status.json"), "utf8", (err, data) => {
    if (err) {
      console.log(err);
      res.json([]);
      return;
    }
    res.json(JSON.parse(data));
  });
});

Router.use(
  basicAuth({
    users: { dpuser: dpSecret },
  })
);

Router.post("/status", validate({ body: statusSchema }), function (req, res) {
  if (!req.is("application/json")) res.sendStatus(415);

  res.setHeader("Content-Type", "application/json");
  const data = JSON.stringify(req.body, null);

  fs.writeFile(path.join("/tmp", "status.json"), data, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    res.json(data);
  });
});

module.exports = Router;
