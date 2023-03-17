const listHelper = require("../utils/list_helper");

const {
    listWithOneBlog,
    blogs,
    listWithZeroBlogs,
} = require("./list_of_blogs");

describe("Favourite blog", () => {
    //can use toEqual as well, but it doesnt check for undefined attributes or array values
    test("when list with one blog, favourite is the blog", () => {
        const result = listHelper.favouriteBlog(listWithOneBlog);
        expect(result).toStrictEqual({
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0,
        });
    });

    test("when list with multiple blogs, favourite is the correct one", () => {
        const result = listHelper.favouriteBlog(blogs);
        expect(result).toStrictEqual({
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0,
        });
    });

    test("when list has zero blogs, should return empty object", () => {
        const result = listHelper.favouriteBlog(listWithZeroBlogs);
        expect(result).toStrictEqual({});
    });
});
