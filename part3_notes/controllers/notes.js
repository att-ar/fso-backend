const notesRouter = require("express").Router();
const Note = require("../models/note");

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

notesRouter.post("/", async (request, response) => {
    const body = request.body;

    const note = new Note({
        content: body.content,
        important: body.important || false,
    });

    const savedNote = await note.save();
    response.status(201).json(savedNote);

    // // leaving here for reference because of the error handling
    // note.save()
    //     .then((savedNote) => {
    //         response.status(201).json(savedNote);
    //     })
    //     .catch((error) => next(error));
});

notesRouter.delete("/:id", async (request, response) => {
    await Note.findByIdAndRemove(request.params.id);
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
