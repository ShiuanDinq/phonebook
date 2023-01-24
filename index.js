const express = require("express");
var bodyParser = require("body-parser");
var morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const Person = require("./models/person");

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

const app = express();
app.use(cors());
app.use(express.static("build"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),

      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      JSON.stringify(req.body),
    ].join(" ");
  })
);
app.use(errorHandler);

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

app.get("/", (request, response) => {
  response.send("<p>HELLO WORLD</p>");
});

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((persons) => {
      response.json(persons);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).send({ error: "Person not found!" });
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((person) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons/", (request, response, next) => {
  const { name, number } = request.body;

  if (!name || !number) {
    response.status(404).send({ error: "Missing detail!" });
  }

  Person.find({ name: name }).then((persons) => {
    if (persons.length > 0) {
      response.status(404).send({ error: "Person already exist in database" });
    }
  });

  const person = new Person({
    ...request.body,
    id: getRandomInt(100000),
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndUpdate(request.params.id, request.body)
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
