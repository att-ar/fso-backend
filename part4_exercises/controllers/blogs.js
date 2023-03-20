const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const jwt = require("jsonwebtoken");
const { userExtractor } = require("../utils/middleware");

//check the part3_notes/notes.js for explanation of the urls omitting /api/blogs
blogsRouter.get("/", async (request, response) => {
    const blogs = await Blog.find({}).populate("user", {
        username: 1,
        name: 1,
    });
    response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
    const blog = await Blog.findById(request.params.id);
    if (blog) {
        response.json(blog);
    } else {
        // 404 not found if the id does not point to a blog
        response.status(404).end();
    }
});

const checkUserValidity = (response, userId, blog) => {
    if (!userId) {
        //status 401 Unauthorized
        // this condition will never be satisfied because jwt.verify throws an error first
        // but the notes have it here so i will leave it
        return response.status(401).json({ error: "token invalid" });
    } else if (userId !== blog.user.toString()) {
        //status 401 Unauthorized
        return response.status(401).json({ error: "user permissions invalid" });
    }
};

blogsRouter.post("/", userExtractor, async (request, response) => {
    const user = request.user;

    const { title, author, url, id } = request.body;
    const blog = new Blog({
        title,
        author,
        url,
        id,
        user: user.id,
    });

    const postedBlog = await blog.save();
    user.blogs = user.blogs.concat(postedBlog._id);
    await user.save();
    response.status(201).json(postedBlog);
});

blogsRouter.delete("/:id", userExtractor, async (request, response) => {
    const user = request.user;
    const blogToDelete = await Blog.findById(request.params.id);

    checkUserValidity(response, user.id, blogToDelete);

    await blogToDelete.deleteOne();
    user.blogs = user.blogs.filter((blog) => blog.id !== request.params.id);
    user.save();
    response.status(204).end();
});

blogsRouter.put("/:id", userExtractor, async (request, response) => {
    const requestUser = request.user;
    const blogToUpdate = await Blog.findById(request.params.id);

    checkUserValidity(response, requestUser.id, blogToUpdate);

    const { title, author, url, likes, user } = request.body;
    const newBlog = {
        title,
        author,
        url,
        likes,
        user,
    };
    const updatedBlog = await blogToUpdate.replaceOne(newBlog);
    response.status(200).json(updatedBlog);
});

module.exports = blogsRouter;
