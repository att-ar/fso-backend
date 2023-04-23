import { NewPatient, Gender } from "./types";

const isString = (text: unknown): text is string => {
    return typeof text === "string" || text instanceof String;
};
const parseText = (text: unknown): string => {
    if (!isString(text)) {
        throw new Error(`Invalid type of ${typeof text} for ${text}`);
    }
    return text;
};
const isDate = (date: string): boolean => {
    //built-in Date module
    return Boolean(Date.parse(date));
};
const parseDate = (date: unknown): string => {
    if (!isString(date) || !isDate(date)) {
        throw new Error("Incorrect or missing date: " + date);
    }
    return date;
};
const isGender = (param: string): param is Gender => {
    return Object.values(Gender)
        .map((v) => v.toString())
        .includes(param);
};
const parseGender = (gender: unknown): Gender => {
    if (!isString(gender) || !isGender(gender)) {
        throw new Error(`Gender '${gender}' is invalid`);
    }
    return gender;
};

export const toNewPatient = (object: unknown): NewPatient => {
    if (!object || typeof object !== "object") {
        throw new Error("Incorrect or missing data");
    }

    if (
        "name" in object &&
        "dateOfBirth" in object &&
        "ssn" in object &&
        "gender" in object &&
        "occupation" in object
    ) {
        const newEntry: NewPatient = {
            name: parseText(object.name),
            dateOfBirth: parseDate(object.dateOfBirth),
            ssn: parseText(object.ssn),
            gender: parseGender(object.gender),
            occupation: parseText(object.occupation),
        };

        return newEntry;
    }
    throw new Error("Incorrect data: some fields are missing");
};
