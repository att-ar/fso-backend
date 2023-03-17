const listHelper = require("../utils/list_helper");
const helper = require("./test_helper");

describe("most likes", () => {
    test("when list has one blog, equals the likes of the blog", () => {
        const result = listHelper.mostLikes(helper.listWithOneBlog);
        expect(result).toStrictEqual({
            author: "Edsger W. Dijkstra",
            likes: 5,
        });
    });

    test("when list has many blogs, equals the correct author", () => {
        const result = listHelper.mostLikes(helper.blogs);
        expect(result).toStrictEqual({
            author: "Edsger W. Dijkstra",
            likes: 17,
        });
    });

    test("when list has zero, equals empty object", () => {
        const result = listHelper.mostLikes(helper.listWithZeroBlogs);
        expect(result).toStrictEqual({});
    });
});
