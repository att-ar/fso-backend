import { Courses } from "./Content";

const Total = (props: Courses) => {
    return (
        <div>
            Number of exercises{" "}
            {props.courses.reduce(
                (carry, part) => carry + part.exerciseCount,
                0
            )}
        </div>
    );
};

export default Total;
