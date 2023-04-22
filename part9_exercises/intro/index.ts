import express from "express";
import qs from "qs";
import bmiCalculator from "./bmiCalculator";
import exerciseCalculator from "./exerciseCalculator";

const app = express();
app.use(express.json());

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

app.post("/exercises", (req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { daily_exercises, target } = req.body;
    if (!daily_exercises || !target) {
        return res.status(400).json({ error: "missing parameters" });
    }
    if (!(daily_exercises instanceof Array) || isNaN(Number(target))) {
        return res.status(400).json({ error: "malformatted parameters" });
    }
    if (daily_exercises.length === 0) {
        return res.status(400).json({ error: "malformatted parameters" });
    }
    for (const num of daily_exercises) {
        if (isNaN(Number(num))) {
            return res.status(400).json({ error: "malformatted parameters" });
        }
    }
    // at this point daily_exercises is an array and only contains numbers

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return res
        .status(200)
        .json(exerciseCalculator(daily_exercises as number[], Number(target)));
});

const PORT = 3003;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
