import { v1 as uuid } from "uuid";

import patients from "../../data/patients";
import { Patient, NoSensitiveInfoPatient, NewPatient } from "../types";

const getPatients = (): Patient[] => patients;

const getNoSensitiveInfoPatients = (): NoSensitiveInfoPatient[] => {
    return patients.map(({ id, name, dateOfBirth, gender, occupation }) => ({
        id,
        name,
        dateOfBirth,
        gender,
        occupation,
    }));
};

const addPatient = (patient: NewPatient): Patient => {
    const newPatient = {
        id: uuid(),
        ...patient,
    };
    patients.push(newPatient);
    return newPatient;
};

export default {
    getPatients,
    getNoSensitiveInfoPatients,
    addPatient,
};
