import diaries from "../../data/entries";
import { DiaryEntry, NonSensitiveDiaryEntry, NewDiaryEntry } from "../types";

const getEntries = (): DiaryEntry[] => {
    return diaries;
};

const getNonSensitiveEntries = (): NonSensitiveDiaryEntry[] => {
    // return diaryData; // notice how there is no error even tho this has more than the defined attributes
    return diaries.map(({ id, date, weather, visibility }) => ({
        id,
        date,
        weather,
        visibility,
    }));
};

const findById = (id: number): DiaryEntry | undefined => {
    return diaries.find((d) => d.id === id);
};

const addDiary = (entry: NewDiaryEntry): DiaryEntry => {
    const newDiaryEntry = {
        id: Math.max(...diaries.map((d) => d.id)) + 1,
        ...entry,
    };

    diaries.push(newDiaryEntry); //modifies in-memory
    return newDiaryEntry;
};

export default {
    getEntries,
    getNonSensitiveEntries,
    findById,
    addDiary,
};
