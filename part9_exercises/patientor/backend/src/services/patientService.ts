import patients from "../../data/patients";
import { Patient, NoSensitiveInfoPatient } from "../types";

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

export default {
    getPatients,
    getNoSensitiveInfoPatients,
};
