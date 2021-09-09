const basicAuth = require("express-basic-auth");
const express = require("express");
const fs = require("fs");
const path = require("path");

const Router = express.Router();
const dpSecret = process.env.dpSecret || "supersecret";
const dpuser = "dpuser";

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

Router.post("/status", function (req, res) {
  if (!req.is("application/json")) res.sendStatus(415);

  res.setHeader("Content-Type", "application/json");
  const data = JSON.stringify(req.body, null);
  console.log(data);
  fs.writeFile(path.join("/tmp", "status.json"), data, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    res.json(data);
  });
});

module.exports = Router;
