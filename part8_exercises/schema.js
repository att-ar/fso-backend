const typeDefs = `
    input BookFilter {
        author: String
        genre: String
    }
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
            bookFilter: BookFilter
            ): [Book]!
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
    type Subscription {
        bookAdded: Book!
    }
`;

module.exports = typeDefs;
