import express from "express";
import routes from "./routes/index.js";
import cors from "cors";

const app = express();

const port = process.env.PORT_BACKEND || 8080;

const corsOptions = {
  origin: "http://localhost:3000",
  // credentials: true,
  // optionSuccessStatus: 200
};

app.use(express.json());
app.use(cors(corsOptions));

// ROUTES ARE HERE IN ONE PLACE
app.use("/", routes);

// throw 404 if URL not found
app.all("*", (req, res, next) => {
  const error = new Error("Page not found!");
  error.statusCode = 404;
  return next(error);
});

// ERROR
app.use((error, req, res, next) => {
  const { message, data } = error;
  const status = error.statusCode || 500;

  res.status(status).json({
    message,
    data,
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
