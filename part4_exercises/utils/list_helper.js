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

module.exports = {
    dummy,
    totalLikes,
    favouriteBlog,
};
