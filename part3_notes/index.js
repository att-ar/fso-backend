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

app.use(express.static(path.join(__dirname, "frontend/build")));
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// let notes = [
//     {
//         id: 1,
//         content: "HTML is easy",
//         important: true,
//     },
//     {
//         id: 2,
//         content: "Browser can execute only JavaScript",
//         important: false,
//     },
//     {
//         id: 3,
//         content: "GET and POST are the most important methods of HTTP protocol",
//         important: true,
//     },
// ];

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

app.get("/api/notes", (request, response) => {
    Note.find({}).then((notes) => {
        response.json(notes);
    });
});

app.get("/api/notes/:id", (request, response, next) => {
    Note.findById(request.params.id)
        .then((note) => {
            if (note) {
                response.json(note);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => next(error));
});

const generateId = () => {
    const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
    return maxId + 1;
};

app.post("/api/notes", (request, response, next) => {
    const body = request.body;
    // no longer need this because of Mongoose validation
    // if (body.content === undefined) {
    //     return response.status(400).json({ error: "content missing" });
    // }

    const note = new Note({
        content: body.content,
        important: body.important || false,
    });

    note.save()
        .then((savedNote) => {
            response.json(savedNote);
        })
        .catch((error) => next(error));
});

//my implementation:
// app.put("/api/notes/:id", (request, response) => {
//     // the id below is from the object not the url
//     // const id = Number(request.params.id);
//     const id = request.params.id;
//     // no longer a number with MongoDB

//     Note.replaceOne({ _id: id }, { ...request.body })
//         .then((note) => {
//             response.json(note);
//         })
//         .catch((error) => {
//             console.log("ID does not exist");
//             console.error(error.message);
//         });
// });
// FSO implementation: I used a similar method (findOneAndUpdate)
// for the phonebook but i had upsert: true
// so that it doesnt add only modifies existing things
app.put("/api/notes/:id", (request, response, next) => {
    const { content, important } = request.body;

    Note.findByIdAndUpdate(
        request.params.id,
        { content, important },
        { new: true, runValidators: true, context: "query" }
    )
        .then((updatedNote) => {
            response.json(updatedNote);
        })
        .catch((error) => next(error));
});

// my implementation:
// app.delete("/api/notes/:id", (request, response) => {
//     // const id = Number(request.params.id);
//     const id = request.params.id;
//     // no longer a number with MongoDB

//     Note.deleteOne({ _id: id })
//         .then((deleteCount) => {
//             response.json(deleteCount);
//         })
//         .catch((error) => {
//             console.log("ID does not exist");
//             console.error(error.message);
//         });
// });
// FSO implementation
app.delete("/api/notes/:id", (request, response, next) => {
    console.log(request.params.id);
    Note.findByIdAndRemove(request.params.id)
        .then((result) => {
            response.status(204).end();
        })
        .catch((error) => next(error));
});

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" });
    } else if (error.name === "ValidationError") {
        return response.status(400).send(error.message);
    }

    next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
