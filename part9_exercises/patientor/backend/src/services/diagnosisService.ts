import diagnoses from "../../data/diagnoses";
import { Diagnosis } from "../types";

const getAllDiagnoses = (): Diagnosis[] => diagnoses;

export default {
    getAllDiagnoses,
};
