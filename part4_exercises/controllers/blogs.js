const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const { userExtractor } = require("../utils/middleware");

//check the part3_notes/notes.js for explanation of the urls omitting /api/blogs
blogsRouter.get("/", async (request, response) => {
    const blogs = await Blog.find({}).populate("user", {
        username: 1,
        name: 1,
        id: 1,
    });
    response.json(blogs);
});

blogsRouter.get("/:id", async (request, response) => {
    const blog = await Blog.findById(request.params.id).populate("user", {
        username: 1,
        name: 1,
        id: 1,
    });
    if (blog) {
        response.json(blog);
    } else {
        // 404 not found if the id does not point to a blog
        response.status(404).end();
    }
});

const checkUserValidity = (response, userId, blog) => {
    if (userId.error) {
        //status 401 Unauthorized
        // this condition will never be satisfied because jwt.verify throws an error first
        // but the notes have it here so i will leave it
        // I changed the condition from !userId to userId.error, maybe this can pass now
        return response.status(401).json({ error: "token invalid" });
    } else if (userId !== blog.user.toString()) {
        //status 401 Unauthorized
        return response.status(401).json({ error: "user permissions invalid" });
    }
};

blogsRouter.post("/", userExtractor, async (request, response) => {
    const user = request.user;

    const { title, author, url } = request.body;
    const blog = new Blog({
        title,
        author,
        url,
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
    // console.log(request.params.id);
    user.blogs = user.blogs.filter((blog) => blog.id !== request.params.id);
    user.save();
    response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
    // const requestUser = request.user;
    // I removed userExtractor middleware from this request
    const blogToUpdate = await Blog.findById(request.params.id);

    // checkUserValidity(response, requestUser.id, blogToUpdate);
    // can only like a blog if you're already logged in
    // if someone is going out of there to send requests to the backend
    // that's honestly cool with me

    const updatedBlog = await blogToUpdate.replaceOne(request.body);
    response.status(200).json(updatedBlog);
});

//comments on a blog post:
// don't need get functionality since they're stored in the blog

blogsRouter.post("/:id/comments", async (request, response) => {
    const comment = request.body.data;
    const blog = await Blog.findById(request.params.id);
    blog.comments = blog.comments.concat(comment);

    const postedBlog = await blog.save();
    response.status(204).json(postedBlog);
});

module.exports = blogsRouter;
