const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

console.log("connecting to", url);

mongoose
    .connect(url)
    .then((result) => {
        console.log("connected to MongoDB");
    })
    .catch((error) => {
        console.log("error connecting to MongoDB:", error.message);
    });

const numberValidator = (phoneNum) => {
    console.log(phoneNum, typeof phoneNum);
    const hyphen = phoneNum.indexOf("-");

    if (hyphen + 1) {
        if (hyphen === 2 || hyphen === 3) {
            const numberRegex = new RegExp(
                `\\d{${hyphen}}-\\d{${phoneNum.length - (hyphen + 1)}}`
            );
            return numberRegex.test(phoneNum);
        } else {
            return false;
        }
    } else {
        const numberRegex = new RegExp(`\\d{${phoneNum.length}}`);
        return numberRegex.test(phoneNum);
    }
};

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 3,
        required: true,
    },
    number: {
        type: String,
        minLength: 8,
        required: true,
        validate: {
            validator: numberValidator,
            message: (props) =>
                `${props.value} must be numerical of form 'xx-...', 'xxx-...' or no hyphen`,
        },
    },
});

personSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Person", personSchema);
