const lodash = require("lodash");

const dummy = () => {
    return 1;
};

const totalLikes = (blogs) => {
    const total = blogs.reduce((curSum, blog) => curSum + blog.likes, 0);
    return total;
};

const favouriteBlog = (blogs) => {
    const fave = blogs.reduce(
        (curFave, blog) => {
            return blog.likes > curFave.likes ? blog : curFave;
        },
        { likes: 0 }
    );
    return fave.likes ? fave : {};
};

const groupByAuthorAndPosts = (blogs) => {
    // returns
    // [
    //     {author: String, posts: Number},
    //     {...},
    //      ...
    // ]
    return lodash
        .chain(blogs)
        .groupBy("author")
        .map((value, key) => ({ author: key, posts: value.length }))
        .value();
};

const groupByAuthorAndLikes = (blogs) => {
    const reduceLikes = (posts) => {
        return posts.reduce((likes, post) => likes + post.likes, 0);
    };

    return lodash
        .chain(blogs)
        .groupBy("author")
        .map((value, key) => ({ author: key, likes: reduceLikes(value) }))
        .value();
};

const reduceBy = (groupedAuthors, key) => {
    return groupedAuthors.reduce(
        (hold, writer) => {
            return writer[key] > hold[key] ? writer : hold;
        },
        { [key]: 0 }
    );
};
const mostBlogs = (blogs) => {
    const groupedAuthors = groupByAuthorAndPosts(blogs);
    const mostAuthor = reduceBy(groupedAuthors, "posts");
    return groupedAuthors.length === 0
        ? {}
        : { author: mostAuthor.author, blogs: mostAuthor.posts };
};

const mostLikes = (blogs) => {
    const groupedAuthors = groupByAuthorAndLikes(blogs);
    const mostAuthor = reduceBy(groupedAuthors, "likes");
    return groupedAuthors.length === 0
        ? {}
        : { author: mostAuthor.author, likes: mostAuthor.likes };
};

module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
    mostBlogs,
    mostLikes,
};
