const express = require("express");
var bodyParser = require("body-parser");
var morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();

// parse application/x-www-form-urlencoded

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const app = express();

app.use(cors());
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

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

app.get("/", (request, response) => {
  response.send("<p>HELLO WORLD</p>");
});

app.get("/api/persons", (request, response) => {
  response.send(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === +id);
  if (person) {
    response.send(person);
  } else {
    response.status(404).send({ error: "Person not found!" });
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === +id);
  persons = persons.filter((person) => person.id !== +id);
  response.status(204).end();
});

app.post("/api/persons/", (request, response) => {
  const { name, number } = request.body;
  if (!name || !number) {
    response.status(404).send({ error: "Missing detail!" });
  } else if (persons.find((person) => person.name === name)) {
    response.status(404).send({ error: "Person already exist in database" });
  } else {
    const personObject = {
      ...request.body,
      id: getRandomInt(100000),
    };

    persons = persons.concat(personObject);
    response.send(personObject);
  }
});

app.put("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === +id);
  if (person) {
    const updatedPersons = persons.map((person) => {
      if (person.id === +id) {
        return {
          ...person,
          ...request.body,
        };
      } else {
        return person;
      }
    });
    response.send({
      ...request.body,
      id,
    });
  }
});

app.get("/api/info", (request, response) => {
  const info = `<div><p>Phonebook has info for ${
    persons.length
  } people</p><p>${new Date()}</p></div>`;

  response.send(info);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
