interface Summary {
    periodLength: number;
    trainingDays: number;
    success: boolean;
    rating: number;
    ratingDescription: string;
    target: number;
    average: number;
}

type Rating = { success: boolean; rating: number; ratingDescription: string };

const calcRating = (target: number, average: number): Rating => {
    const difference = target - average;
    if (difference < 0)
        return {
            success: true,
            rating: 3,
            ratingDescription: "Nice, you beat the target!",
        };
    if (average / target >= 0.85)
        return {
            success: false,
            rating: 2,
            ratingDescription: "Close, need a little bit more next time.",
        };
    return {
        success: false,
        rating: 1,
        ratingDescription: "Not enough was done this time, gotta get better.",
    };
};
const calculateExercises = (data: number[], target: number): Summary => {
    const trainingDays = data.filter((d) => d !== 0);
    const average =
        trainingDays.reduce((curSum, hours) => (curSum += hours)) / data.length;
    const { success, rating, ratingDescription } = calcRating(target, average);
    return {
        periodLength: data.length,
        trainingDays: trainingDays.length,
        success,
        rating,
        ratingDescription,
        target,
        average,
    };
};

console.log(calculateExercises([3, 4, 2, 4.5, 0, 3, 1], 2));
