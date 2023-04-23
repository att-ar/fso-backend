import express from "express";

import patientService from "../services/patientService";

//baseURl will be /api/diagnoses
const router = express.Router();

router.get("/", (_req, res) => {
    res.send(patientService.getNoSensitiveInfoPatients());
});

export default router;
