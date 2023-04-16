type Operation = "add" | "multiply" | "divide";

const calculator = (a: number, b: number, text: Operation): number => {
    switch (text) {
        case "add":
            return a + b;
        case "multiply":
            return a * b;
        case "divide":
            if (b === 0) throw new Error("Division by Zero Error");
            return a / b;
        default:
            throw new Error("Operation is not multiply, add or divide!");
    }
};

try {
    const a: number = Number(process.argv[2]);
    const b: number = Number(process.argv[3]);
    const text: string = process.argv[4];
    const validOperations: Operation[] = ["add", "multiply", "divide"];
    if (validOperations.includes(text as Operation)) {
        console.log(calculator(a, b, text as Operation));
    } else {
        throw new Error(`'${text}' is not a valid operation`);
    }
} catch (error: unknown) {
    let errorMessage = "Something went wrong: ";
    if (error instanceof Error) {
        errorMessage += error.message;
    }
    console.log(errorMessage);
}
