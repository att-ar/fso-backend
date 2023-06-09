const listHelper = require("../utils/list_helper");
const helper = require("./test_helper");
// https://jestjs.io/docs/api#testonlyname-fn-timeout
// methods for only doing certain tests, etc. a lot of stuff

// Another way of running a single test (or describe block) is to specify the name of the test to be run with the -t flag:
// npm test -- -t "when list has only one blog, equals the likes of that"
describe("total likes", () => {
    test("when list has only one blog, equals the likes of that", () => {
        const result = listHelper.totalLikes(helper.listWithOneBlog);
        expect(result).toBe(5);
    });

    test("when list has multiple blogs, equals the correct total", () => {
        const result = listHelper.totalLikes(helper.blogs);
        expect(result).toBe(36);
    });

    test("when list has zero blogs, equals zero", () => {
        const result = listHelper.totalLikes(helper.listWithZeroBlogs);
        expect(result).toBe(0);
    });
});
