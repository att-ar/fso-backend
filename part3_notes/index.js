//
const express = require("express");
const cors = require("cors");
const app = express();
//

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

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static("build"));

let notes = [
    {
        id: 1,
        content: "HTML is easy",
        important: true,
    },
    {
        id: 2,
        content: "Browser can execute only JavaScript",
        important: false,
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        important: true,
    },
];

app.get("/", (request, response) => {
    response.send("<h1>Hello World!</h1>");
});

app.get("/api/notes", (request, response) => {
    response.json(notes);
});

app.get("/api/notes/:id", (request, response) => {
    const id = Number(request.params.id);
    // returns a string, so need to convert it to a number
    // console.log(id);
    const note = notes.find((note) => {
        // console.log(note.id, typeof note.id, id, typeof id);
        return note.id === id;
    });
    if (note) {
        response.json(note);
    } else {
        // response.statusMessage = "Note does not exist.";
        // ^ overrides the default Not Found error message
        response.status(404).end();
    }
});

app.delete("/api/notes/:id", (request, response) => {
    const id = Number(request.params.id);
    notes = notes.filter((note) => note.id !== id);
    response.status(204).end();
});

const generateID = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
    return maxId + 1;
};

app.post("/api/notes", (request, response) => {
    const body = request.body;
    // ensures the body is not empty
    //very important to return here, otherwise app will continue.
    if (!body.content) {
        return response.status(400).json({
            error: "content missing",
        });
    }
    // sets the default value of important to false
    const note = {
        content: body.content,
        important: body.important || false,
        date: new Date(),
        id: generateID(),
    };
    notes = notes.concat(note);

    response.json(note);
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
