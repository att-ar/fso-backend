const listHelper = require("../utils/list_helper");
const {
    listWithOneBlog,
    blogs,
    listWithZeroBlogs,
} = require("./list_of_blogs");

describe("most likes", () => {
    test("when list has one blog, equals the likes of the blog", () => {
        const result = listHelper.mostLikes(listWithOneBlog);
        expect(result).toStrictEqual({
            author: "Edsger W. Dijkstra",
            likes: 5,
        });
    });

    test("when list has many blogs, equals the correct author", () => {
        const result = listHelper.mostLikes(blogs);
        expect(result).toStrictEqual({
            author: "Edsger W. Dijkstra",
            likes: 17,
        });
    });

    test("when list has zero, equals empty object", () => {
        const result = listHelper.mostLikes(listWithZeroBlogs);
        expect(result).toStrictEqual({});
    });
});
