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

        expect(result.body.error).toContain("Password is too short");

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

    describe("when there are some blogs initially", () => {
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

        describe("Adding a blog to the database", () => {
            test("successfully responds with status code 201 when blog and user are valid", async () => {
                const blog = helper.singleBlog;

                await api
                    .post("/api/blogs")
                    .send(blog)
                    .expect(201)
                    .expect("Content-Type", /application\/json/);

                const blogsAfter = await helper.blogsInDb();
                expect(blogsAfter).toHaveLength(helper.blogs.length + 1);
                const blogsStripped = blogsAfter.map(
                    ({ title, author, url, likes }) => ({
                        title,
                        author,
                        url,
                        likes,
                    })
                );
                expect(blogsStripped).toContainEqual(blog);
            });

            test("adding blog with missing likes defaults to 0 likes", async () => {
                const blog = helper.singleBlogNoLikes;
                const response = await api.post("/api/blogs").send(blog);
                expect(response.body.likes).toBe(0);
            });

            test("missing title fails with status code 400", async () => {
                const blog = helper.singleBlogNoTitle;
                await api.post("/api/blogs").send(blog).expect(400);
            });

            test("missing url fails with status code 400", async () => {
                const blog = helper.singleBlogNoUrl;
                await api.post("/api/blogs").send(blog).expect(400);
            });
        });

        describe("deleting a blog from the database", () => {
            test("successfully deletes and responds with status code 204 when id is valid", async () => {
                const blogsAtStart = await helper.blogsInDb();
                const blogToDelete = blogsAtStart[0];
                await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

                const blogsAtEnd = await helper.blogsInDb();
                expect(blogsAtEnd).toHaveLength(helper.blogs.length - 1);
                expect(blogsAtEnd).not.toContainEqual(blogToDelete);
            });
        });

        describe("updating a blog in the database", () => {
            test("successfully return status code 200 when valid update is made", async () => {
                const blogsAtStart = await helper.blogsInDb();
                const blogToUpdate = blogsAtStart[0];
                const newBlog = {
                    ...blogToUpdate,
                    likes: blogToUpdate.likes + 921,
                };
                await api
                    .put(`/api/blogs/${blogToUpdate.id}`)
                    .send(newBlog)
                    .expect(200)
                    .expect("Content-Type", /application\/json/);

                const blogsAtEnd = await helper.blogsInDb();
                const updatedBlog = blogsAtEnd[0];
                expect(updatedBlog.likes).toBe(blogToUpdate.likes + 921);
            });
        });
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});
