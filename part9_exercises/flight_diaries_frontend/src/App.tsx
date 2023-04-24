import { useState, useEffect } from "react";
import {
    NonSensitiveDiaryEntry,
    Weather,
    Visibility,
    NewDiaryEntry,
} from "./types";
import { getAllDiaries, createDiary } from "./diaryService";

const App = () => {
    const [diaries, setDiaries] = useState<NonSensitiveDiaryEntry[]>([]);
    const today = new Date();
    const todayDate = `${today.getFullYear()}-${
        today.getMonth() + 1
    }-${today.getDate()}`;
    const [newDate, setNewDate] = useState(todayDate);
    const [newWeather, setNewWeather] = useState<Weather>(Weather.Sunny);
    const [newVisibility, setNewVisibility] = useState<Visibility>(
        Visibility.Good
    );
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        getAllDiaries().then((data) => {
            setDiaries(data);
        });
    }, []);

    const noteCreation = (event: React.SyntheticEvent) => {
        event.preventDefault();
        //newNote is the state
        const interimDiary: NewDiaryEntry = {
            date: newDate,
            weather: newWeather,
            visibility: newVisibility,
        };
        if (newComment !== "") interimDiary.comment = newComment;
        createDiary(interimDiary).then((data) => {
            setDiaries(diaries.concat(data));
        });

        // setNewNote("");
    };
    return (
        <div>
            <h2>Add new entry</h2>
            <form onSubmit={noteCreation}>
                <div>
                    {"Date: "}
                    <input
                        name="date"
                        value={newDate}
                        onChange={(event) => setNewDate(event.target.value)}
                    />
                </div>
                <div>
                    {"Weather: "}
                    <input
                        name="weather"
                        value={newWeather}
                        onChange={(event) => {
                            setNewWeather(event.target.value as Weather);
                        }}
                    />
                </div>
                <div>
                    {"Visibility: "}
                    <input
                        name="visibility"
                        value={newVisibility}
                        onChange={(event) =>
                            setNewVisibility(event.target.value as Visibility)
                        }
                    />
                </div>
                <div>
                    {"Comment: "}
                    <input
                        name="comment"
                        value={newComment}
                        onChange={(event) => setNewComment(event.target.value)}
                    />
                </div>
                <button type="submit">add</button>
            </form>
            <div style={{ paddingTop: 5 }}>
                {diaries.map((d) => (
                    <span key={d.id}>
                        <strong>{d.date}</strong>
                        <p>
                            {d.weather}
                            <br />
                            {d.visibility}
                        </p>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default App;
