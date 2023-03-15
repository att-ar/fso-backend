require("dotenv").config();

const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");
const path = require("path");
const { response } = require("express");

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

//make sure to use cors(), not cors...
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(
    morgan(
        ":method :url :status :res[content-length] - :response-time ms :postData"
    )
);
app.use(express.static(path.join(__dirname, "build")));

// let persons = [
//     {
//         id: 1,
//         name: "Arto Hellas",
//         number: "040-123456",
//     },
//     {
//         id: 2,
//         name: "Ada Lovelace",
//         number: "39-44-5323523",
//     },
//     {
//         id: 3,
//         name: "Dan Abramov",
//         number: "12-43-234345",
//     },
//     {
//         id: 4,
//         name: "Mary Poppendieck",
//         number: "39-23-6423122",
//     },
// ];

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.get("/api/persons", (request, response) => {
    //Person.find() returns a list of objects satisfying the query predicate
    Person.find({}).then((persons) => {
        response.json(persons);
    });
});

app.get("/api/persons/info", (request, response) => {
    const dateObj = new Date();
    Person.find({}).then((persons) => {
        console.log(typeof persons.length);
        const numPersons = persons.length;
        result = `<p>
        Phonebook has info for ${numPersons} ${
            numPersons === 1 ? "person" : "people"
        }
    </p>
    <p>
        ${dateObj}
    </p>`;
        response.send(result);
    });
});

app.get("/api/persons/:id", (request, response) => {
    Person.findById(request.params.id)
        .then((person) => {
            response.json(person);
        })
        .catch((error) => next(error));
});

// app.delete("/api/persons/:id", (request, response) => {
//     // const id = Number(request.params.id);
//     const id = request.params.id;
//     // no longer a number with MongoDB

//     Person.deleteOne({ _id: id })
//         .then((deleteCount) => {
//             response.json(deleteCount);
//         })
//         .catch((error) => next(error));
// });

app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then((result) => {
            console.log(`Deleted ${result.name}`);
            response.status(204).end();
        })
        .catch((error) => next(error));
});

// const generateID = () => {
//     return Math.floor(Math.random() * 100000);
// };

app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response
            .status(400)
            .json({
                error: "Information is missing",
            })
            .end();
    }
    const person = new Person({
        name: body.name,
        number: body.number,
    });

    person.save().then((savedPerson) => {
        response.json(savedPerson);
    });
});

app.put("/api/persons/:id", (request, response) => {
    const body = request.body;
    //using findOneandUpdate because the phonebook gives the option to overwrite.
    // check if there is a id value passed in request
    Person.findOneAndUpdate(
        { name: body.name },
        { number: body.number },
        { new: true, upsert: true }
    )
        .then((person) => {
            response.json(person);
        })
        .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" });
    }

    next(error);
};

app.use(errorHandler);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
