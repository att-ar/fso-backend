import express from "express";
import cors from "cors";

import diagnosisRouter from "./routes/diagnoses";
import patientRouter from "./routes/patients";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/diagnoses", diagnosisRouter);
app.use("/api/patients", patientRouter);

app.get("/api/ping", (_req, res) => {
    console.log("someone pinged here");
    res.json({ result: "pong" });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
