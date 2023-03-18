const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");

const helper = require("./test_helper");

beforeEach(async () => {
    await Blog.deleteMany({});

    const blogObjects = helper.blogs.map((blog) => new Blog(blog));
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
});

describe("blog api tests", () => {
    test("The blogs are returned as JSON", async () => {
        await api
            .get("/api/blogs")
            .expect(200)
            .expect("Content-Type", /application\/json/);
    });

    test("There are 6 blogs", async () => {
        const response = await api.get("/api/blogs");
        expect(response.body).toHaveLength(helper.blogs.length);
    });

    test("Unique identifier is 'id'", async () => {
        const blogs = await helper.blogsInDb();
        blogs.forEach((blog) => expect(blog.id).toBeDefined());
    });

    test("blog is properly added", async () => {
        const blog = helper.singleBlog;

        await api
            .post("/api/blogs")
            .send(blog)
            .expect(201)
            .expect("Content-Type", /application\/json/);

        const blogsAfter = await helper.blogsInDb();
        expect(blogsAfter).toHaveLength(helper.blogs.length + 1);
        const blogsStripped = blogsAfter.map(
            ({ title, author, url, likes }) => ({ title, author, url, likes })
        );
        expect(blogsStripped).toContainEqual(blog);
    });

    test("missing likes defaults to 0", async () => {
        const blog = helper.singleBlogNoLikes;
        const response = await api.post("/api/blogs").send(blog);
        expect(response.body.likes).toBe(0);
    });

    test("missing title, blog is not added", async () => {
        const blog = helper.singleBlogNoTitle;
        await api.post("/api/blogs").send(blog).expect(400);
    });

    test("missing url, blog is not added", async () => {
        const blog = helper.singleBlogNoUrl;
        await api.post("/api/blogs").send(blog).expect(400);
    });
});

afterAll(async () => {
    await mongoose.connection.close();
});
