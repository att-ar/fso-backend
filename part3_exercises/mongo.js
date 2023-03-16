const mongoose = require("mongoose");

if (process.argv.length < 3) {
    console.log("give password (and name and number) as 3 arguments");
    process.exit(1);
} else if (process.argv.length > 5) {
    console.log("Use quotation marks if there's a space in name or number");
    process.exit(1);
}

const password = process.argv[2];
const databaseName = "phonebook";

const url = `mongodb+srv://atryolo:${password}@fsomongodb.bsmvrh8.mongodb.net/${databaseName}?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
    Person.find({}).then((result) => {
        console.log(`${databaseName}:`);
        result.forEach(({ name, number }) => {
            console.log(`${name} ${number}`);
        });
        mongoose.connection.close();
    });
} else {
    try {
        const name = process.argv[3];
        const number = process.argv[4];
        if (number === undefined) {
            console.log("Missing name or number");
            process.exit(1);
        }

        const person = new Person({
            name,
            number,
        });

        person.save().then(() => {
            console.log("person added!");
            mongoose.connection.close();
        });
    } catch (error) {
        console.error(error);
    }
}
