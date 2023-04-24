import CoursePart from "../types";

const Part = ({ course }: { course: CoursePart }) => {
    const assertNever = (value: never): never => {
        throw new Error(
            `Unhandled discriminated union member: ${JSON.stringify(value)}`
        );
    };
    const strongStyle = { fontWeight: "bold", fontSize: 17 };
    switch (course.kind) {
        case "basic":
            return (
                <p>
                    <span style={strongStyle}>
                        {course.name} {course.exerciseCount}
                    </span>
                    <br />
                    Description: <i>{course.description}</i>
                </p>
            );
        case "group":
            return (
                <p>
                    <span style={strongStyle}>
                        {course.name} {course.exerciseCount}
                    </span>
                    <br />
                    Group projects: {course.groupProjectCount}
                </p>
            );
        case "background":
            return (
                <p>
                    <span style={strongStyle}>
                        {course.name} {course.exerciseCount}
                    </span>
                    <br />
                    Background material: {course.backgroundMaterial}
                </p>
            );
        case "special":
            return (
                <p>
                    <span style={strongStyle}>
                        {course.name} {course.exerciseCount}
                    </span>
                    <br />
                    Required skills:{" "}
                    {course.requirements.map((val, idx, arr) => {
                        if (idx < arr.length - 1) return `${val}, `;
                        return val;
                    })}
                </p>
            );
        default:
            return assertNever(course);
    }
};

export default Part;
