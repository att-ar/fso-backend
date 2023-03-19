const supertest = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);
const User = require("../models/user");
const Note = require("../models/note");

//Adding users to the test db first, needed for auth testing later
describe("when there is initially two users in db", () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash("sekret", 10);
        const user = new User({ username: "root", passwordHash });
        await user.save();

        const passwordHash2 = await bcrypt.hash("melatonin", 10);
        const user2 = new User({
            username: "tears",
            passwordHash: passwordHash2,
        });
        await user2.save();
    });
    test("creation succeeds with a fresh username", async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "mluukkai",
            name: "Matti Luukkainen",
            password: "salainen",
        };

        await api
            .post("/api/users")
            .send(newUser)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

        const usernames = usersAtEnd.map((u) => u.username);
        expect(usernames).toContain(newUser.username);
    });

    test("creation fails with proper statuscode and message if username already taken", async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "root",
            name: "Superuser",
            password: "salainen",
        };

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/);

        expect(result.body.error).toContain("expected `username` to be unique");

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart);
    });
});

//Note testing with user auth
describe("when there is initially some notes and users saved", () => {
    beforeEach(async () => {
        //need to do this so that I can use the note api with a token
        // the goal is to make "root" post the notes and have the ids propagate correctly
        // I want the initial notes to all have user IDs so I can test authentification stuff
        const loginResponse = await api
            .post("/api/login")
            .send({ username: "root", password: "sekret" });
        const authToken = "Bearer " + loginResponse.body.token;

        await Note.deleteMany({});

        for (let note of helper.initialNotes) {
            await api
                .post("/api/notes")
                .set("authorization", authToken)
                .send(note);
        }

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
        test("succeeds with a valid note and user login", async () => {
            //need to get a valid user token
            const response = await api.post("/api/login").send({
                username: "root",
                password: "sekret",
            });

            const userToken = "Bearer " + response.body.token;

            const newNote = {
                content: "async/await simplifies making async calls",
                important: true,
            };
            //need to add a .set("Authorization", token)
            // must be after post and before send
            await api
                .post("/api/notes")
                .set("authorization", userToken)
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

        test("fails with status code 400 if token is not real", async () => {
            const newNote = {
                content: "async/await simplifies making async calls",
                important: true,
            };
            const userToken = "Bearer 90iag";
            await api
                .post("/api/notes")
                .set("authorization", userToken)
                .send(newNote)
                .expect(400)
                .expect("Content-Type", /application\/json/);
        });
    });

    describe("deletion of a note", () => {
        test("succeeds with status code 204 if id and user are valid", async () => {
            const notesAtStart = await helper.notesInDb();
            const noteToDelete = notesAtStart[0];

            const response = await api.post("/api/login").send({
                username: "root",
                password: "sekret",
            });

            const userToken = "Bearer " + response.body.token;

            await api
                .delete(`/api/notes/${noteToDelete.id}`)
                .set("authorization", userToken)
                .expect(204);

            const notesAtEnd = await helper.notesInDb();

            expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1);

            //gets the content property of each note
            const contents = notesAtEnd.map((n) => n.content);
            expect(contents).not.toContain(noteToDelete.content);
        });

        test("fails with status code 401 if ids are valid but user did not create the note", async () => {
            const notesAtStart = await helper.notesInDb();
            const noteToDelete = notesAtStart[0];

            const response = await api.post("/api/login").send({
                username: "tears",
                password: "melatonin",
            });

            const userToken = "Bearer " + response.body.token;

            await api
                .delete(`/api/notes/${noteToDelete.id}`)
                .set("authorization", userToken)
                .expect(401)
                .expect("Content-Type", /application\/json/);
        });

        test("fails with status code 400 if user does not exist", async () => {
            const notesAtStart = await helper.notesInDb();
            const noteToDelete = notesAtStart[0];

            const userToken = "Bearer 09asf";

            await api
                .delete(`/api/notes/${noteToDelete.id}`)
                .set("authorization", userToken)
                .expect(400)
                .expect("Content-Type", /application\/json/);
        });
    });

    describe("updating a note", () => {
        //work on this next
        test("a note's importance can be toggled by the user who created it", async () => {
            const notesAtStart = await helper.notesInDb();
            const noteToToggle = notesAtStart[0];
            const toggledNote = {
                ...noteToToggle,
                important: !noteToToggle.important,
            };

            const loginResponse = await api
                .post("/api/login")
                .send({ username: "root", password: "sekret" });

            const userToken = "Bearer " + loginResponse.body.token;

            await api
                .put(`/api/notes/${noteToToggle.id}`)
                .set("Authorization", userToken)
                .send(toggledNote)
                .expect(200)
                .expect("Content-Type", /application\/json/);

            const notesAtEnd = await helper.notesInDb();
            expect(notesAtEnd).toHaveLength(helper.initialNotes.length);

            expect(notesAtEnd[0]).toEqual(toggledNote);
        });
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});
