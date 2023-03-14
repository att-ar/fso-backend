const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

// making a morgan token for logging the data sent in POST requests
const onlyPostData = (request, response) => {
    if (request.method === "POST") {
        return JSON.stringify(request.body);
    }
};
morgan.token("postData", (request, response) =>
    onlyPostData(request, response)
);

const requestLogger = (request, response, next) => {
    console.log("Method:", request.method);
    console.log("Path:  ", request.path);
    console.log("Body:  ", request.body);
    console.log("---");
    next();
};

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" });
};

//make sure to use cors(), not cors...
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :postData"
    )
);

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

app.get("/api/persons", (request, response) => {
    response.json(persons);
});

app.get("/api/persons/info", (request, response) => {
    const dateObj = new Date();
    result = `<p>
        Phonebook has info for ${persons.length} ${
        persons.length === 1 ? "person" : "people"
    }
    </p>
    <p>
        ${dateObj}
    </p>`;
    response.send(result);
});

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    const person = persons.find((person) => person.id === id);

    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
});

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter((person) => person.id !== id);
    response.status(204).end();
});

const generateID = () => {
    return Math.floor(Math.random() * 100000);
};

app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "Information is missing",
        });
    } else if (persons.find((person) => person.name === body.name)) {
        return response.status(400).json({
            error: "name must be unique",
        });
    }

    const person = {
        id: generateID(),
        name: body.name,
        number: body.number,
    };
    persons = persons.concat(person);

    response.json(person);
});

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
