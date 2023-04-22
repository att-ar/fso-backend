import express from "express";

const router = express.Router();

router.get("/", (_req, res) => {
    console.log("here");
    res.status(200).json({ result: "Fetching all diaries!" });
});

router.post("/", (_req, res) => {
    res.send("Saving a diary!");
});

export default router;
