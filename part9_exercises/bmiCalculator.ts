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

console.log(calculateBmi(183, 63));
