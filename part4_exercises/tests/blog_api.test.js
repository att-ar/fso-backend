const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const bcrypt = require("bcrypt");

const Blog = require("../models/blog");
const User = require("../models/user");

const helper = require("./test_helper");

describe("when there is initially two users in db", () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash("sekret", 10);
        const user = new User({
            username: "root",
            name: "Keshi",
            passwordHash,
        });
        await user.save();

        const passwordHash2 = await bcrypt.hash("melatonin", 10);
        const user2 = new User({
            username: "tears",
            name: "Abel",
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

    test("fails with statuscode 400 and message if username is taken", async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "root",
            name: "Remarkable Human",
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

    test("fails with statuscode 400 and message if username isn't long enough", async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "ro",
            name: "Remarkable Human",
            password: "salainen",
        };

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/);

        expect(result.body.error).toContain("is shorter than the minimum");

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart);
    });

    test("fails with statuscode 400 and message if password isn't long enough", async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "rorrr",
            name: "Remarkable Human",
            password: "sa",
        };

        const result = await api
            .post("/api/users")
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/);

        expect(result.body.error).toContain("Password must be");

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toEqual(usersAtStart);
    });
});

describe("when there is initally some blogs and users in db", () => {
    beforeEach(async () => {
        //need to do this so that I can use the note api with a token
        // the goal is to make "root" post the notes and have the ids propagate correctly
        // I want the initial notes to all have user IDs so I can test authentification stuff
        const loginResponse = await api
            .post("/api/login")
            .send({ username: "root", password: "sekret" });
        const authToken = "Bearer " + loginResponse.body.token;

        await Blog.deleteMany({});

        for (let blog of helper.blogs) {
            await api
                .post("/api/blogs")
                .set("authorization", authToken)
                .send(blog);
        }
    });

    describe("checking blog properties", () => {
        test("The blogs are returned as JSON", async () => {
            await api
                .get("/api/blogs")
                .expect(200)
                .expect("Content-Type", /application\/json/);
        });

        test("There is a correct number of blogs", async () => {
            const response = await api.get("/api/blogs");
            expect(response.body).toHaveLength(helper.blogs.length);
        });

        test("Unique identifier of blogs is 'id'", async () => {
            const blogs = await helper.blogsInDb();
            blogs.forEach((blog) => expect(blog.id).toBeDefined());
        });
    });

    describe("viewing a specific blog", () => {
        test("a specific blog can be viewed", async () => {
            const blogsAtStart = await helper.blogsInDb();
            const blogToView = blogsAtStart[0];

            const result = await api
                .get(`/api/blogs/${blogToView.id}`)
                .expect(200)
                .expect("Content-Type", /application\/json/);
            const resultBlog = result.body;
            expect({ ...resultBlog, user: resultBlog.user.id }).toEqual({
                ...blogToView,
                user: blogToView.user.toString(),
            });
        });

        test("fails with statuscode 404 if blog was already deleted", async () => {
            const validNonexistingId = await helper.nonExistingId();

            await api.get(`/api/blogs/${validNonexistingId}`).expect(404);
        });
        test("fails with statuscode 400 if id is invalid, blog never existed", async () => {
            // this is for when a blog has never been added to the db in the first place
            // the url address was never created
            const invalidId = "5a3d5da59070081a82a3445";

            await api.get(`/api/blogs/${invalidId}`).expect(400);
        });
    });

    describe("adding a blog to the database", () => {
        test("successfully responds with status code 201 when blog and user are valid", async () => {
            //need to get a valid user token
            const login = await api.post("/api/login").send({
                username: "root",
                password: "sekret",
            });
            const userToken = "Bearer " + login.body.token;

            const blog = helper.singleBlog;

            await api
                .post("/api/blogs")
                .set("Authorization", userToken)
                .send(blog)
                .expect(201)
                .expect("Content-Type", /application\/json/);

            const blogsAfter = await helper.blogsInDb();
            expect(blogsAfter).toHaveLength(helper.blogs.length + 1);
            const titles = blogsAfter.map(({ title }) => title);
            expect(titles).toContain(blog.title);
        });

        test("adding blog with missing likes defaults to 0 likes", async () => {
            //need to get a valid user token
            const login = await api.post("/api/login").send({
                username: "root",
                password: "sekret",
            });
            const userToken = "Bearer " + login.body.token;
            const blog = helper.singleBlogNoLikes;
            const response = await api
                .post("/api/blogs")
                .set("Authorization", userToken)
                .send(blog);
            expect(response.body.likes).toBe(0);
        });

        test("missing information fails with status code 400", async () => {
            //need to get a valid user token
            const response = await api.post("/api/login").send({
                username: "root",
                password: "sekret",
            });
            const userToken = "Bearer " + response.body.token;
            const blog = helper.singleBlogNoTitle;
            await api
                .post("/api/blogs")
                .set("Authorization", userToken)
                .send(blog)
                .expect(400);
        });

        // test("missing url fails with status code 400", async () => {
        //     //need to get a valid user token
        //     const response = await api.post("/api/login").send({
        //         username: "root",
        //         password: "sekret",
        //     });
        //     const userToken = "Bearer " + response.body.token;
        //     const blog = helper.singleBlogNoUrl;
        //     await api
        //         .post("/api/blogs")
        //         .set("Authorization", userToken)
        //         .send(blog)
        //         .expect(400);
        // });

        test("fails with status code 401 if token is not real", async () => {
            const newBlog = {
                content: "async/await simplifies making async calls",
                important: true,
            };
            const userToken = "Bearer 90iag";
            await api
                .post("/api/blogs")
                .set("authorization", userToken)
                .send(newBlog)
                .expect(401)
                .expect("Content-Type", /application\/json/);
        });

        test("fails with status code 401 if token is missing", async () => {
            const newBlog = {
                content: "async/await simplifies making async calls",
                important: true,
            };
            await api
                .post("/api/blogs")
                .send(newBlog)
                .expect(401)
                .expect("Content-Type", /application\/json/);
        });
    });

    describe("deleting a blog from the database", () => {
        test("succeeds with status code 204 if id and user are valid", async () => {
            const blogsAtStart = await helper.blogsInDb();
            const blogToDelete = blogsAtStart[0];

            const response = await api.post("/api/login").send({
                username: "root",
                password: "sekret",
            });

            const userToken = "Bearer " + response.body.token;

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set("authorization", userToken)
                .expect(204);

            const blogsAtEnd = await helper.blogsInDb();

            expect(blogsAtEnd).toHaveLength(helper.blogs.length - 1);

            //gets the content property of each blog
            const titlesAndUsers = blogsAtEnd.map(({ title, user }) => ({
                title,
                user,
            }));
            expect(titlesAndUsers).not.toContainEqual({
                title: blogToDelete.title,
                user: blogToDelete.user,
            });
        });

        test("fails with status code 401 if ids are valid but user did not create the blog", async () => {
            const blogsAtStart = await helper.blogsInDb();
            const blogToDelete = blogsAtStart[0];
            // real but incorrect user
            const response = await api.post("/api/login").send({
                username: "tears",
                password: "melatonin",
            });

            const userToken = "Bearer " + response.body.token;

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set("authorization", userToken)
                .expect(401)
                .expect("Content-Type", /application\/json/);
        });

        test("fails with status code 401 if user does not exist", async () => {
            const blogsAtStart = await helper.blogsInDb();
            const blogToDelete = blogsAtStart[0];

            const userToken = "Bearer 09asf";

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set("authorization", userToken)
                .expect(401)
                .expect("Content-Type", /application\/json/);
        });
    });

    describe("updating a blog in the database", () => {
        test("return status code 200 when valid blog is liked", async () => {
            const blogsAtStart = await helper.blogsInDb();
            const blogToUpdate = blogsAtStart[0];
            const newBlog = {
                ...blogToUpdate,
                likes: blogToUpdate.likes + 1,
            };

            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(newBlog)
                .expect(200)
                .expect("Content-Type", /application\/json/);

            const blogsAtEnd = await helper.blogsInDb();
            expect(blogsAtEnd).toHaveLength(helper.blogs.length);
            expect(blogsAtEnd[0]).toEqual(newBlog);
        });
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});
