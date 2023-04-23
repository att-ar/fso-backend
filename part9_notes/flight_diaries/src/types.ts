export type Weather = "sunny" | "rainy" | "cloudy" | "windy" | "stormy";

export type Visibility = "great" | "good" | "ok" | "poor";

export interface DiaryEntry {
    id: number;
    date: string;
    weather: Weather;
    visibility: Visibility;
    comment?: string; // optional parameter
}
// utility type
// there is pick and omit, self-explanatory
// this is the equivalent as the Omit
//  Pick<DiaryEntry, 'id' | 'date' | 'weather' | 'visibility'>
export type NonSensitiveDiaryEntry = Omit<DiaryEntry, "comment">;
