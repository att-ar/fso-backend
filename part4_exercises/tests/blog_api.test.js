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
});

afterAll(async () => {
    await mongoose.connection.close();
});
