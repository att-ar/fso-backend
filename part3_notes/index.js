require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

const Note = require("./models/note");

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

app.get("/api/notes", (request, response) => {
    Note.find({}).then((notes) => {
        response.json(notes);
    });
});

app.get("/api/notes/:id", (request, response) => {
    Note.findById(request.params.id).then((note) => {
        response.json(note);
    });
});

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
    return maxId + 1;
};

app.post("/api/notes", (request, response) => {
    const body = request.body;

    if (body.content === undefined) {
        return response.status(400).json({ error: "content missing" });
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
    });

    note.save().then((savedNote) => {
        response.json(savedNote);
    });
});

app.put("/api/notes/:id", (request, response) => {
    // the id below is from the object not the url
    // const id = Number(request.params.id);
    const id = request.params.id;
    // no longer a number with MongoDB

    Note.replaceOne({ _id: id }, { ...request.body })
        .then((note) => {
            response.json(note);
        })
        .catch((error) => {
            console.log("ID does not exist");
            console.error(error.message);
        });
});

app.delete("/api/notes/:id", (request, response) => {
    // const id = Number(request.params.id);
    const id = request.params.id;
    // no longer a number with MongoDB

    Note.deleteOne({ _id: id })
        .then((deleteCount) => {
            response.json(deleteCount);
        })
        .catch((error) => {
            console.log("ID does not exist");
            console.error(error.message);
        });
});

app.use(unknownEndpoint);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
