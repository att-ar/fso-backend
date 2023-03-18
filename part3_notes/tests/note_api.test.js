const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Note = require("../models/note");

const helper = require("./test_helper");

beforeEach(async () => {
    await Note.deleteMany({});
    await Note.insertMany(helper.initialNotes);

    // const noteObjects = helper.initialNotes.map((note) => new Note(note));
    // const promiseArray = noteObjects.map((note) => note.save());
    // await Promise.all(promiseArray);
    // Promise.all() does everything in parallel
    // use for ... of loop if the order matters:

    // await Note.deleteMany({});

    // for (let note of helper.initialNotes) {
    //     let noteObject = new Note(note);
    //     await noteObject.save();
    // }
});

describe("when there is initially some notes saved", () => {
    //the application/json is a regex
    test("notes are returned as json", async () => {
        await api
            .get("/api/notes")
            .expect(200)
            .expect("Content-Type", /application\/json/);
    });

    test("all notes are returned", async () => {
        const response = await api.get("/api/notes");
        expect(response.body).toHaveLength(helper.initialNotes.length);
    });

    test("a specific note is within the returned notes", async () => {
        const response = await api.get("/api/notes");
        const contents = response.body.map((r) => r.content);
        expect(contents).toContain("Browser can execute only JavaScript");
    });

    describe("viewing a specific note", () => {
        test("a specific note can be viewed", async () => {
            const notesAtStart = await helper.notesInDb();
            const noteToView = notesAtStart[0];

            const resultNote = await api
                .get(`/api/notes/${noteToView.id}`)
                .expect(200)
                .expect("Content-Type", /application\/json/);

            expect(resultNote.body).toEqual(noteToView);
        });

        test("fails with statuscode 404 if note does not exist", async () => {
            const validNonexistingId = await helper.nonExistingId();

            await api.get(`/api/notes/${validNonexistingId}`).expect(404);
        });

        test("fails with statuscode 400 if id is invalid", async () => {
            const invalidId = "5a3d5da59070081a82a3445";

            await api.get(`/api/notes/${invalidId}`).expect(400);
        });
    });

    describe("addition of a new note", () => {
        test("succeeds with a valid note", async () => {
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
            expect(contents).toContain(
                "async/await simplifies making async calls"
            );
        });

        test("fails with status code 400 if data invalid", async () => {
            const newNote = {
                important: true,
            };

            await api.post("/api/notes").send(newNote).expect(400);

            const notesAtEnd = await helper.notesInDb();

            expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
        });
    });

    describe("deletion of a note", () => {
        test("succeeds with status code 204 if id is valid", async () => {
            const notesAtStart = await helper.notesInDb();
            const noteToDelete = notesAtStart[0];

            await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

            const notesAtEnd = await helper.notesInDb();

            expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);

            //gets the content property of each note
            const contents = notesAtEnd.map((n) => n.content);
            expect(contents).not.toContain(noteToDelete.content);
        });
    });

    describe("updating a note succeeds if the note exists and update is valid", () => {
        test("a note's importance can be toggled", async () => {
            const notesAtStart = await helper.notesInDb();
            const noteToToggle = notesAtStart[0];
            const toggledNote = {
                ...noteToToggle,
                important: !noteToToggle.important,
            };

            await api
                .put(`/api/notes/${noteToToggle.id}`)
                .send(toggledNote)
                .expect(200)
                .expect("Content-Type", /application\/json/);

            const notesAtEnd = await helper.notesInDb();
            expect(notesAtEnd).toHaveLength(helper.initialNotes.length);

            expect(notesAtEnd[0]).toEqual(toggledNote);
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
});
