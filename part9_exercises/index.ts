import express from "express";
import qs from "qs";
import bmiCalculator from "./bmiCalculator";

const app = express();

app.set("query parser", (str: string) => qs.parse(str));

app.get("/bmi?", (req, res) => {
    try {
        const { height, weight } = req.query;
        const result = bmiCalculator(Number(height), Number(weight));
        if (typeof result === "string") {
            throw new Error(result);
        } else {
            res.json(result);
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            //bad request error code
            res.status(400).json({ error: error.message });
        }
    }
});

const PORT = 3003;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
