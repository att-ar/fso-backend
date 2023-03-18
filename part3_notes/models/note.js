const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        minlength: 5,
    },
    important: Boolean,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
});
// user references the object ID of the User who created it

noteSchema.set("toJSON", {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        returnedObject.user = returnedObject.user.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model("Note", noteSchema);
