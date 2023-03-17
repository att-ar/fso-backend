const listHelper = require("../utils/list_helper");
const helper = require("./test_helper");

describe("most blogs", () => {
    test("when list has one blog, equals the author of the blog", () => {
        const result = listHelper.mostBlogs(helper.listWithOneBlog);
        expect(result).toStrictEqual({
            author: "Edsger W. Dijkstra",
            blogs: 1,
        });
    });

    test("when list has many blogs, equals the correct author", () => {
        const result = listHelper.mostBlogs(helper.blogs);
        expect(result).toStrictEqual({
            author: "Robert C. Martin",
            blogs: 3,
        });
    });

    test("when list has zero, equals empty object", () => {
        const result = listHelper.mostBlogs(helper.listWithZeroBlogs);
        expect(result).toStrictEqual({});
    });
});
