/* import and initialize express app */
const express = require("express");
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL || "postgres://localhost:5432/acme_hr_db");
const app = express();
const PORT = 3000;

/* this middleware deals with CORS errors and allows the client on port 5173 to access the server */
const cors = require("cors");
/* morgan is a logging library that allows us to see the requests being made to the server */
const morgan = require("morgan");

const errorHandler = require("./middleware/index");

/* set up express middleware */
app.use(morgan("dev"));
const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* set up initial hello world route */
app.get("/", (req, res) => {
  res.send("Hello World!");
});

/* set up api route */
app.get("/api/employees", async (req, res) => {
  try {
    const SQL = `SELECT * FROM employees;`;
    const response = await client.query(SQL);
    res.json(response.rows); // Send the employee data as JSON response
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/* our middleware won't capture 404 errors, so we're setting up a separate error handler for those */
app.use((req, res, next) => {
  res.status(404).send("Sorry, can't find that!");
});
app.use(errorHandler); // Correctly use the error handler middleware

/* initialize server (listen) */
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
