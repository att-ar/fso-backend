const { GraphQLError } = require("graphql");
const jwt = require("jsonwebtoken");
const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

const findBy = (args) => {
    const filter = {};
    Object.keys(args).forEach((k) => {
        if (k === "genre") {
            filter.genres = { $all: args[k] };
        } else {
            filter[k] = args[k];
        }
    });
    return filter;
};

const resolvers = {
    Query: {
        bookCount: async () => Book.count(),
        allBooks: async (root, { bookFilter }) => {
            if (bookFilter === {} || bookFilter === undefined)
                return Book.find({}).populate("author");
            if (bookFilter.author) {
                const aId = await Author.findOne({ name: bookFilter.author });
                bookFilter.author = aId._id.toString();
            }
            const filter = await findBy(bookFilter);
            return Book.find(filter).populate("author");
        },
        authorCount: async () => Author.count(),
        allAuthors: async () => Author.find({}),
        me: (root, args, { currentUser }) => currentUser,
    },
    Author: {
        bookCount: async (root) => {
            return root.books.length;
        },
    },
    Mutation: {
        addAuthor: async (root, args) => {
            const author = new Author({ ...args });

            try {
                await author.save();
            } catch (error) {
                throw new GraphQLError("Saving author failed", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args.name,
                        error,
                    },
                });
            }

            return author;
        },
        editAuthor: async (root, args, { currentUser }) => {
            const author = await Author.findOne({ name: args.name }).exec();

            if (!currentUser) {
                throw new GraphQLError("not authenticated", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                    },
                });
            }

            try {
                author.born = args.setBornTo;
                await author.save();
            } catch (error) {
                throw new GraphQLError("Editing birthyear failed", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args.name,
                        error,
                    },
                });
            }
            return author;
        },
        addBook: async (root, args, { currentUser }) => {
            const { author: authorName, ...argsNew } = args;
            const book = new Book({ ...argsNew });

            if (!currentUser) {
                throw new GraphQLError("not authenticated", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                    },
                });
            }

            try {
                //recall that in addBook, book.author is just a string, not object
                let bookAuthor = await Author.findOne({ name: authorName });
                if (!bookAuthor) {
                    try {
                        bookAuthor = new Author({
                            name: authorName,
                        });
                        //save() resolves to the document that is saved
                        // need this because it gets the author's id
                        bookAuthor = await bookAuthor.save();
                    } catch (error) {
                        throw new GraphQLError("Saving author failed", {
                            extensions: {
                                code: "BAD_USER_INPUT",
                                invalidArgs: args.author,
                                error,
                            },
                        });
                    }
                }
                //respecting the mongoose schema for Book in ./models/book.js
                bookAuthor.books.push(book._id);
                await bookAuthor.save();
                book.author = bookAuthor;
                await book.save();
            } catch (error) {
                throw new GraphQLError("Saving book failed", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args.name,
                        error,
                    },
                });
            }
            pubsub.publish("BOOK_ADDED", { bookAdded: book });
            return book;
        },
        createUser: async (root, args) => {
            const user = new User({
                username: args.username,
                favoriteGenre: args.favoriteGenre,
            });

            return user.save().catch((error) => {
                throw new GraphQLError("Creating the user failed", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                        invalidArgs: args.name,
                        error,
                    },
                });
            });
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username });
            //hardcode all passwords to "secret"
            if (!user || args.password !== "secret") {
                throw new GraphQLError("wrong credentials", {
                    extensions: {
                        code: "BAD_USER_INPUT",
                    },
                });
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            };

            return { value: jwt.sign(userForToken, process.env.SECRET) };
        },
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator("BOOK_ADDED"),
        },
    },
};

module.exports = resolvers;
