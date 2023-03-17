const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Note = require("../models/note");

const helper = require("./test_helper");

beforeEach(async () => {
    await Note.deleteMany({});

    const noteObjects = helper.initialNotes.map((note) => new Note(note));
    const promiseArray = noteObjects.map((note) => note.save());
    await Promise.all(promiseArray);
    // Promise.all() does everything in parallel
    // use for ... of loop if the order matters:

    // await Note.deleteMany({});

    // for (let note of helper.initialNotes) {
    //     let noteObject = new Note(note);
    //     await noteObject.save();
    // }
});

//the application/json is a regex
test("notes are returned as json", async () => {
    await api
        .get("/api/notes")
        .expect(200)
        .expect("Content-Type", /application\/json/);
});

test("there are two notes", async () => {
    const response = await api.get("/api/notes");

    expect(response.body).toHaveLength(helper.initialNotes.length);
});

test("the first note is about HTTP methods", async () => {
    const response = await api.get("/api/notes");
    const contents = response.body.map((r) => r.content);
    expect(contents).toContain("Browser can execute only JavaScript");
});

test("a valid note can be added", async () => {
    const newNote = {
        content: "async/await simplifies making async calls",
        important: true,
    };
    await api
        .post("/api/notes")
        .send(newNote)
        .expect(201)
        .expect("Content-Type", /application\/json/);

    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);

    const contents = notesAtEnd.map((n) => n.content);
    expect(contents).toContain("async/await simplifies making async calls");
});

test("note without content is not added", async () => {
    const newNote = {
        important: true,
    };

    await api.post("/api/notes").send(newNote).expect(400);

    const notesAtEnd = await helper.notesInDb();

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
});

test("a specific note can be viewed", async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToView = notesAtStart[0];

    const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect("Content-Type", /application\/json/);

    expect(resultNote.body).toEqual(noteToView);
});

test("a note can be deleted", async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToDelete = notesAtStart[0];

    await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

    const notesAtEnd = await helper.notesInDb();

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);

    //gets the content property of each note
    const contents = notesAtEnd.map((n) => n.content);
    expect(contents).not.toContain(noteToDelete.content);
});

test("a note's importance can be toggled", async () => {
    const notesAtStart = await helper.notesInDb();
    const noteToToggle = notesAtStart[0];
    const toggledNote = { ...noteToToggle, important: !noteToToggle.important };

    await api
        .put(`/api/notes/${noteToToggle.id}`)
        .send(toggledNote)
        .expect(200)
        .expect("Content-Type", /application\/json/);

    const notesAtEnd = await helper.notesInDb();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);

    expect(notesAtEnd[0]).toEqual(toggledNote);
});

afterAll(async () => {
    await mongoose.connection.close();
});
