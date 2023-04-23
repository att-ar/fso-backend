import express from "express";

import diagnosisService from "../services/diagnosisService";

//baseURl will be /api/diagnoses
const router = express.Router();

router.get("/", (_req, res) => {
    res.send(diagnosisService.getAllDiagnoses());
});

export default router;
