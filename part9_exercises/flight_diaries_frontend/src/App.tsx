import { useState, useEffect } from "react";
import {
    NonSensitiveDiaryEntry,
    Weather,
    Visibility,
    NewDiaryEntry,
} from "./types";
import { getAllDiaries, createDiary } from "./diaryService";

const Notification = ({ errorMess }: { errorMess: string }) => {
    return <p style={{ color: "red" }}>{errorMess}</p>;
};

const App = () => {
    const [diaries, setDiaries] = useState<NonSensitiveDiaryEntry[]>([]);
    const today = new Date();
    const todayDate = `${today.getFullYear()}-${(today.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${today.getDate()}`;
    const [newDate, setNewDate] = useState(todayDate);
    const [newWeather, setNewWeather] = useState<Weather>(Weather.Sunny);
    const [newVisibility, setNewVisibility] = useState<Visibility>(
        Visibility.Good
    );
    const [newComment, setNewComment] = useState("");
    const [errorMess, setErrorMess] = useState("");

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
            if (typeof data === "string") {
                setErrorMess(data);
                setTimeout(() => setErrorMess(""), 7000);
            } else {
                setDiaries(diaries.concat(data));
            }
        });
    };
    return (
        <div>
            <h2>Add New Entry</h2>
            {errorMess !== "" ? <Notification errorMess={errorMess} /> : null}
            <form onSubmit={noteCreation}>
                <div>
                    <strong>{"Date: "}</strong>
                    <input
                        name="date"
                        type="date"
                        value={newDate}
                        onChange={(event) => {
                            console.log(event.target.value);
                            setNewDate(event.target.value);
                        }}
                    />
                </div>
                <div>
                    <strong>{"Weather: "}</strong>
                    Sunny
                    <input
                        type="radio"
                        name="weather"
                        onChange={() => {
                            setNewWeather(Weather.Sunny);
                        }}
                    />
                    Rainy
                    <input
                        type="radio"
                        name="weather"
                        onChange={() => {
                            setNewWeather(Weather.Rainy);
                        }}
                    />
                    Cloudy
                    <input
                        type="radio"
                        name="weather"
                        onChange={() => {
                            setNewWeather(Weather.Cloudy);
                        }}
                    />
                    Stormy
                    <input
                        type="radio"
                        name="weather"
                        onChange={() => {
                            setNewWeather(Weather.Stormy);
                        }}
                    />
                    Windy
                    <input
                        type="radio"
                        name="weather"
                        onChange={() => {
                            setNewWeather(Weather.Windy);
                        }}
                    />
                </div>
                <div>
                    <strong>{"Visibility: "}</strong>
                    Great
                    <input
                        type="radio"
                        name="visibilty"
                        onChange={() => {
                            setNewVisibility(Visibility.Great);
                        }}
                    />
                    Good
                    <input
                        type="radio"
                        name="visibilty"
                        onChange={() => {
                            setNewVisibility(Visibility.Good);
                        }}
                    />
                    Ok
                    <input
                        type="radio"
                        name="visibilty"
                        onChange={() => {
                            setNewVisibility(Visibility.Ok);
                        }}
                    />
                    Poor
                    <input
                        type="radio"
                        name="visibilty"
                        onChange={() => {
                            setNewVisibility(Visibility.Poor);
                        }}
                    />
                </div>
                <div>
                    <strong>{"Comment: "}</strong>
                    <input
                        name="comment"
                        value={newComment}
                        onChange={(event) => setNewComment(event.target.value)}
                    />
                </div>
                <button type="submit">add</button>
            </form>
            <h2>Diary Entries</h2>
            <div style={{ paddingTop: 5 }}>
                {diaries.map((d) => (
                    <span key={d.id}>
                        <strong>{d.date}</strong>
                        <p>
                            Weather: {d.weather}
                            <br />
                            Visibility: {d.visibility}
                        </p>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default App;
