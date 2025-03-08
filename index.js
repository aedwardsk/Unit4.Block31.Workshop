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
    const SQL = /*sql*/ `SELECT * FROM employees;`;
    const response = await client.query(SQL);
    res.json(response.rows);
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

// create your init function
const init = async () => {
  try {
    await client.connect();
    const SQL = /*sql*/ `
      DROP TABLE IF EXISTS employees;
      CREATE TABLE employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        phone VARCHAR(255),
        isAdmin BOOLEAN
      );
      INSERT INTO employees (name, phone, isAdmin) VALUES
      ('Albert Mills', '(946) 529-4164', false),
      ('Jose Stamm', '1-405-787-8749 x4311', false),
      ('Ms. Allison Lehner', '996.680.3262 x467', false),
      ('Jessie Dibbert', '(204) 816-2524 x53873', false),
      ('Miss Maria Kiehn', '(206) 990-1990 x8370', false),
      ('Geraldine King DDS', '337.218.2322 x6035', false),
      ('Jaime Murazik', '(820) 544-8026 x284', true),
      ('Brian Monahan', '(839) 289-4790 x338', false),
      ('Vivian Reinger', '297.696.9011 x342', true),
      ('Elbert Kiehn', '(339) 543-5497 x24059', false);
    `;
    await client.query(SQL);
    console.log("data seeded");
    app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
  } catch (error) {
    console.error("Error during initialization:", error);
  }
};

// init function invocation
init();
