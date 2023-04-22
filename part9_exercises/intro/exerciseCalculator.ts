import { isNotNumber } from "./utils";

interface Summary {
    periodLength: number;
    trainingDays: number;
    success: boolean;
    rating: number;
    ratingDescription: string;
    target: number;
    average: number;
}

interface Rating {
    success: boolean;
    rating: number;
    ratingDescription: string;
}

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

try {
    if (process.argv[3] === undefined) {
        //this prevents data of length 0
        //whether or not a target was passed doesn't matter if this fails
        throw new Error("insufficient arguments were passed");
    }
    const target = Number(process.argv[2]);
    const data: number[] = process.argv.slice(3).map((arg) => Number(arg));
    if (isNotNumber(target)) {
        throw new Error("target must be a number");
    }
    data.forEach((hour) => {
        if (isNotNumber(hour)) {
            throw new Error("data points must be numbers");
        }
    });
    console.log(calculateExercises(data, target));
} catch (error: unknown) {
    let errorMessage = "Something went wrong: ";
    if (error instanceof Error) {
        errorMessage += error.message;
    }
    console.log(errorMessage);
}

export default calculateExercises;
