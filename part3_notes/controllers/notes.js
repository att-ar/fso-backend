const notesRouter = require("express").Router();
const Note = require("../models/note");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// the urls are relative because this router is only used for calls passed to /api/notes
// because of the following in app.js:
// const notesRouter = require("./controllers/notes");
// app.use("/api/notes", notesRouter);
notesRouter.get("/", async (request, response) => {
    // leaving this for reference (would have to remove async tho)
    // Note.find({}).then((notes) => {
    //     response.json(notes);
    // });
    const notes = await Note.find({});
    response.json(notes);
});

notesRouter.get("/:id", async (request, response) => {
    // // without 'express-async-errors' installed, would need these try/catch blocks
    // // would also have to add the 'next' function argument
    // try {
    //     const note = await Note.findById(request.params.id);
    //     if (note) {
    //         response.json(note);
    //     } else {
    //         response.status(404).end();
    //     }
    // } catch (exception) {
    //     next(exception);
    // }
    const note = await Note.findById(request.params.id);
    if (note) {
        response.json(note);
    } else {
        response.status(404).end();
    }
});

const getTokenFrom = (request) => {
    const authorization = request.get("authorization");
    if (authorization && authorization.startsWith("Bearer ")) {
        return authorization.replace("Bearer ", "");
    }
    return null;
};

notesRouter.post("/", async (request, response) => {
    const body = request.body;
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    if (!decodedToken.id) {
        //status 401 Unauthorized
        return response.status(401).json({ error: "token invalid" });
    }
    const user = await User.findById(decodedToken.id);

    const note = new Note({
        content: body.content,
        important: body.important || false,
        user: user.id,
    });

    const savedNote = await note.save();
    user.notes = user.notes.concat(savedNote._id);
    await user.save();
    response.status(201).json(savedNote);

    // // leaving here for reference because of the error handling
    // note.save()
    //     .then((savedNote) => {
    //         response.status(201).json(savedNote);
    //     })
    //     .catch((error) => next(error));
});

notesRouter.delete("/:id", async (request, response) => {
    const noteToDelete = await Note.findById(request.params.id);
    const noteUserId = noteToDelete.user.toString();

    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);

    if (!decodedToken.id) {
        //status 401 Unauthorized
        return response.status(401).json({ error: "token invalid" });
    } else if (decodedToken.id !== noteUserId) {
        //status 401 Unauthorized
        return response.status(401).json({ error: "user permissions invalid" });
    }

    const user = await User.findById(decodedToken.id);
    await Note.findByIdAndRemove(request.params.id);
    user.notes = user.notes.filter((note) => note.id !== request.params.id);
    user.save();
    response.status(204).end();
});

notesRouter.put("/:id", async (request, response) => {
    const body = request.body;
    // no destructuring here incase the attribute doesnt exist

    const note = {
        content: body.content,
        important: body.important,
    };

    const updatedNote = await Note.findByIdAndUpdate(request.params.id, note, {
        new: true,
    });
    response.status(200).json(updatedNote);
});

module.exports = notesRouter;
