const Blog = require("../models/blog");
const User = require("../models/user");

const blogsInDb = async () => {
    const blogs = await Blog.find({});
    return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
    const users = await User.find({});
    return users.map((u) => u.toJSON());
};

const nonExistingId = async () => {
    const blog = new Blog({
        title: "melatonin tears i cry",
        author: "The Weeknd",
        url: "My dear melancholy",
    });
    await blog.save();
    await blog.deleteOne();

    return blog._id.toString();
};

const listWithOneBlog = [
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
    },
];

const blogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
    },
    {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
    },
    {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
    },
    {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
    },
    {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
    },
];

const listWithZeroBlogs = [];

const singleBlog = {
    title: "Recent Progress in the Definition of Thermodynamic Entropy",
    author: "Enzo Zanchini",
    url: "https://doi.org/10.3390/e16031547",
    likes: 8,
};

const singleBlogNoLikes = {
    title: "Recent Progress in the Definition of Thermodynamic Entropy",
    author: "Enzo Zanchini",
    url: "https://doi.org/10.3390/e16031547",
};

const singleBlogNoTitle = {
    author: "Enzo Zanchini",
    url: "https://doi.org/10.3390/e16031547",
    likes: 8,
};

const singleBlogNoUrl = {
    title: "Recent Progress in the Definition of Thermodynamic Entropy",
    author: "Enzo Zanchini",
    likes: 8,
};

module.exports = {
    blogsInDb,
    usersInDb,
    nonExistingId,
    listWithOneBlog,
    blogs,
    listWithZeroBlogs,
    singleBlog,
    singleBlogNoLikes,
    singleBlogNoTitle,
    singleBlogNoUrl,
};
