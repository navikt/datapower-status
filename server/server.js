const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const statusRoute = require("./routes/status");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(
  //logger("combined", {
  //  skip: function (req, res) {
  //    return res.statusCode < 400;
  //  },
  //})
  logger("tiny")
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static("public"));

// NAIS checks
app.get("/isAlive", (req, res) => res.sendStatus(200));
app.get("/isReady", (req, res) => res.sendStatus(200));

const RateLimit = require("express-rate-limit");
var limiter = RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// apply rate limiter to all requests
app.use(limiter);
app.use(statusRoute);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: err.message });
});

app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

// start express server on port $PORT
app.listen(PORT, () => {
  console.log("server started on port: " + PORT);
});
