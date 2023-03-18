const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");

const helper = require("./test_helper");

beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(helper.blogs);

    // const blogObjects = helper.blogs.map((blog) => new Blog(blog));
    // const promiseArray = blogObjects.map((blog) => blog.save());
    // await Promise.all(promiseArray);
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
        test("successfully responds with status code 201 when blog is valid", async () => {
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

afterAll(async () => {
    await mongoose.connection.close();
});
