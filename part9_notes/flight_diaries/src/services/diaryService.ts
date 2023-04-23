import diaries from "../../data/entries";
import { DiaryEntry, NonSensitiveDiaryEntry } from "../types";

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
const addDiary = () => {
    return null;
};

export default {
    getEntries,
    addDiary,
    getNonSensitiveEntries,
};
