const listHelper = require("../utils/list_helper");
const {
    listWithOneBlog,
    blogs,
    listWithZeroBlogs,
} = require("./list_of_blogs");

describe("most blogs", () => {
    test("when list has one blog, equals the author of the blog", () => {
        const result = listHelper.mostBlogs(listWithOneBlog);
        expect(result).toStrictEqual({
            author: "Edsger W. Dijkstra",
            blogs: 1,
        });
    });

    test("when list has many blogs, equals the correct author", () => {
        const result = listHelper.mostBlogs(blogs);
        expect(result).toStrictEqual({
            author: "Robert C. Martin",
            blogs: 3,
        });
    });

    test("when list has zero, equals empty object", () => {
        const result = listHelper.mostBlogs(listWithZeroBlogs);
        expect(result).toStrictEqual({});
    });
});
