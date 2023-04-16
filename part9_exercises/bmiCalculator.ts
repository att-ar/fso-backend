import { isNotNumber } from "./utils";

interface bmiObject {
    height: number;
    weight: number;
    bmi: string;
}

const calculateBmi = (height: number, weight: number): string => {
    //toFixed returns a string!!
    const bmi: number = Number((weight / (height / 100) ** 2).toFixed(1));
    //using if-immediate
    // https://stackoverflow.com/questions/6665997/switch-statement-for-greater-than-less-than
    if (bmi < 16.0) {
        return "Underweight (Severe thinness)";
    } else if (bmi < 16.9) {
        return "Underweight (Moderate thinness)";
    } else if (bmi < 18.4) {
        return "Underweight (Mild thinness)";
    } else if (bmi < 24.9) {
        return "Normal range";
    } else if (bmi < 29.9) {
        return "Overweight (Pre-obese)";
    } else if (bmi < 34.9) {
        return "Obese (Class I)";
    } else if (bmi < 39.9) {
        return "Obese (Class II)";
    } else return "Obese (Class III)";
};

const bmiCalculator = (height: number, weight: number): bmiObject | string => {
    try {
        if (isNotNumber(height) || isNotNumber(weight)) {
            throw new Error("Both arguments must be numbers");
        }
        if (weight === 0) throw new Error("Division by Zero");
        return {
            height,
            weight,
            bmi: calculateBmi(height, weight),
        };
    } catch (error: unknown) {
        let errorMessage = "Something went wrong: ";
        if (error instanceof Error) {
            errorMessage += error.message;
        }
        return errorMessage;
    }
};

try {
    if (process.argv[2] === undefined || process.argv[3] === undefined) {
        throw new Error(
            "Missing argument(s), need height (cm) and weight (kg)"
        );
    }
    const height: number = Number(process.argv[2]);
    const weight: number = Number(process.argv[3]);
    if (isNotNumber(height) || isNotNumber(weight)) {
        throw new Error("Both arguments must be numbers");
    }
    if (weight === 0) throw new Error("Division by Zero");
    console.log(calculateBmi(height, weight));
} catch (error: unknown) {
    let errorMessage = "Something went wrong: ";
    if (error instanceof Error) {
        errorMessage += error.message;
    }
    console.log(errorMessage);
}

export default bmiCalculator;
