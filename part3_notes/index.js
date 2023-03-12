const express = require("express");
const app = express();
const cors = require("cors");

const path = require("path");

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
app.use(express.static(path.join(__dirname, "frontend/build")));

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

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

app.get("/api/notes", (req, res) => {
    res.json(notes);
});

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
    return maxId + 1;
};

app.post("/api/notes", (request, response) => {
    const body = request.body;

    //the return is important to avoid using an empty note
    if (!body.content) {
        return response.status(400).json({
            error: "content missing",
        });
    }

    const note = {
        content: body.content,
        important: body.important || false,
        id: generateId(),
    };

    notes = notes.concat(note);

    response.json(note);
});

app.put("/api/notes/:id", (request, response) => {
    // the id below is from the object not the url
    const id = Number(request.params.id);
    const note = notes.findIndex((note) => note.id === id);

    if (note >= 0) {
        notes[note] = request.body;
        response.json(notes[note]);
    } else {
        response.status(404).send("Note id does note exist.").end();
    }
});

app.get("/api/notes/:id", (request, response) => {
    const id = Number(request.params.id);
    const note = notes.find((note) => note.id === id);

    if (note) {
        response.json(note);
    } else {
        response.status(404).end();
    }

    response.json(note);
});

app.delete("/api/notes/:id", (request, response) => {
    const id = Number(request.params.id);
    notes = notes.filter((note) => note.id !== id);

    response.status(204).end();
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
