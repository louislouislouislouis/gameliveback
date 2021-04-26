const express = require("express");
const SSEManager = require("./LiveModel/ssemanager");
const HttpError = require("./model/http-err");

const liveRoutes = require("./Routes/LiveRoutes");

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/live", liveRoutes);
app.use((req, res, next) => {
  const error = new HttpError("Could note find this route", 404);
  throw error;
});
app.use((error, req, res, next) => {
  console.log(error.message);
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknow error appears" });
});
app.listen(process.env.PORT || 5000);
