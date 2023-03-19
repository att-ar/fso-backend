const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

//check the part3_notes/notes.js for explanation of the urls omitting /api/blogs
blogsRouter.get("/", async (request, response) => {
    const blogs = await Blog.find({});
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

const getTokenFrom = (request) => {
    const authorization = request.get("authorization");
    if (authorization && authorization.startsWith("Bearer ")) {
        return authorization.replace("Bearer ", "");
    }
    return null;
};
// const checkUserValidity = (response, decodedTokenId, blog) => {
//     if (!decodedTokenId) {
//         //status 401 Unauthorized
//         // this condition will never be satisfied because jwt.verify throws an error first
//         // but the notes have it here so i will leave it
//         return response.status(401).json({ error: "token invalid" });
//     } else if (decodedTokenId !== blog.user.toString()) {
//         //status 401 Unauthorized
//         return response.status(401).json({ error: "user permissions invalid" });
//     }
// };

blogsRouter.post("/", async (request, response) => {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);
    const user = await User.findById(decodedToken.id);
    const blog = new Blog(request.body);

    const postedBlog = await blog.save();
    user.blogs = user.blogs.concat(postedBlog._id);
    await user.save();
    response.status(201).json(postedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
    const body = request.body;
    const newBlog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
    };
    const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        newBlog,
        { new: true }
    );
    response.status(200).json(updatedBlog);
});

module.exports = blogsRouter;
