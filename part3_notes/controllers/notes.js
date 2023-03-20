const notesRouter = require("express").Router();
const Note = require("../models/note");
const { userExtractor } = require("../utils/middleware");

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

const checkUserValidity = (response, decodedTokenId, note) => {
    if (!decodedTokenId) {
        //status 401 Unauthorized
        //this condition will never be satisfied because jwt.verify throws an error first
        return response.status(401).json({ error: "token invalid" });
    } else if (decodedTokenId !== note.user.toString()) {
        //status 401 Unauthorized
        return response.status(401).json({ error: "user permissions invalid" });
    }
};

notesRouter.post("/", userExtractor, async (request, response) => {
    const user = request.user;
    const body = request.body;

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
    // // without the express-async-errors package
    // note.save()
    //     .then((savedNote) => {
    //         response.status(201).json(savedNote);
    //     })
    //     .catch((error) => next(error));
});

notesRouter.delete("/:id", userExtractor, async (request, response) => {
    const requestUser = request.user;
    const noteToDelete = await Note.findById(request.params.id);

    checkUserValidity(response, requestUser.id, noteToDelete);

    await noteToDelete.deleteOne();
    requestUser.notes = requestUser.notes.filter(
        (note) => note.id !== request.params.id
    );
    requestUser.save();
    response.status(204).end();
});

notesRouter.put("/:id", userExtractor, async (request, response) => {
    const requestUser = request.user;
    const noteToUpdate = await Note.findById(request.params.id);

    checkUserValidity(response, requestUser.id, noteToUpdate);

    const { content, important, user } = request.body;

    const note = {
        content,
        important,
        user,
    };

    const updatedNote = await noteToUpdate.replaceOne(note);
    response.status(200).json(updatedNote);
});

module.exports = notesRouter;
