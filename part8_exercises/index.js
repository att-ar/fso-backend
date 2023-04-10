const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { GraphQLError } = require("graphql");

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
require("dotenv").config();

const Author = require("./models/author");
const Book = require("./models/book");
const User = require("./models/user");

const MONGODB_URI = process.env.MONGODB_URI;
console.log("connecting to", MONGODB_URI);
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log("connected to MongoDB");
    })
    .catch((error) => {
        console.log("error connection to MongoDB:", error.message);
    });

// let authors = [
//     {
//         name: "Robert Martin",
//         id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
//         born: 1952,
//     },
//     {
//         name: "Martin Fowler",
//         id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
//         born: 1963,
//     },
//     {
//         name: "Fyodor Dostoevsky",
//         id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
//         born: 1821,
//     },
//     {
//         name: "Joshua Kerievsky", // birthyear not known
//         id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
//     },
//     {
//         name: "Sandi Metz", // birthyear not known
//         id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
//     },
// ];

// let books = [
//     {
//         title: "Clean Code",
//         published: 2008,
//         author: "Robert Martin",
//         id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
//         genres: ["refactoring"],
//     },
//     {
//         title: "Agile software development",
//         published: 2002,
//         author: "Robert Martin",
//         id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
//         genres: ["agile", "patterns", "design"],
//     },
//     {
//         title: "Refactoring, edition 2",
//         published: 2018,
//         author: "Martin Fowler",
//         id: "afa5de00-344d-11e9-a414-719c6709cf3e",
//         genres: ["refactoring"],
//     },
//     {
//         title: "Refactoring to patterns",
//         published: 2008,
//         author: "Joshua Kerievsky",
//         id: "afa5de01-344d-11e9-a414-719c6709cf3e",
//         genres: ["refactoring", "patterns"],
//     },
//     {
//         title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
//         published: 2012,
//         author: "Sandi Metz",
//         id: "afa5de02-344d-11e9-a414-719c6709cf3e",
//         genres: ["refactoring", "design"],
//     },
//     {
//         title: "Crime and punishment",
//         published: 1866,
//         author: "Fyodor Dostoevsky",
//         id: "afa5de03-344d-11e9-a414-719c6709cf3e",
//         genres: ["classic", "crime"],
//     },
//     {
//         title: "The Demon",
//         published: 1872,
//         author: "Fyodor Dostoevsky",
//         id: "afa5de04-344d-11e9-a414-719c6709cf3e",
//         genres: ["classic", "revolution"],
//     },
// ];

const typeDefs = `
    type User {
        username: String!
        favoriteGenre: String!
        id: ID!
    }
    type Token {
        value: String!
    }
    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(
            author: String,
            genre: String
            ): [Book]
        allAuthors: [Author!]
        me: User
    }
    type Author {
        name: String!
        born: Int
        id: ID!
        bookCount: Int!
    }
    type Book {
        title: String!
        published: Int!
        author: Author!
        id: ID!
        genres: [String]
    }
    type Mutation {
        addBook(
            title: String!
            published: Int!
            author: String!
            genres: [String]
        ): Book
        addAuthor(
            name: String!
            born: Int
            bookCount: Int
        ): Author
        editAuthor(
            name: String!
            setBornTo: Int!
        ): Author
        createUser(
            username: String!
            favoriteGenre: String!
        ): User
        login(
            username: String!
            password: String!
        ): Token
    }
`;

// const filterBy = (book, args) => {
//     for (let key in args) {
//         if (key === "genre") {
//             if (!book.genres.includes(args[key])) return false;
//             else continue;
//         }
//         if (args[key] !== book[key]) return false;
//     }
//     return true;
// };
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
        allBooks: async (root, args) => {
            if (!args.author && !args.genre)
                return Book.find({}).populate("author");
            if (args.author) {
                const aId = await Author.findOne({ name: args.author });
                args.author = aId._id.toString();
            }
            const filter = await findBy(args);
            return Book.find(filter).populate("author");
        },
        authorCount: async () => Author.count(),
        allAuthors: async () => Author.find({}),
        me: (root, args, { currentUser }) => currentUser,
    },
    Author: {
        bookCount: async (root) => {
            return Book.count({ author: root._id });
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
                        bookAuthor = new Author({ name: authorName });
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
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null;
        if (auth && auth.startsWith("Bearer ")) {
            const decodedToken = jwt.verify(
                auth.substring(7),
                process.env.SECRET
            );
            const currentUser = await User.findById(decodedToken.id);
            return { currentUser };
        }
    },
}).then(({ url }) => {
    console.log(`Server ready at ${url}`);
});
