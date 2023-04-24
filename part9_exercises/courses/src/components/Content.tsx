import Part from "./Part";
import CoursePart from "../types";
export interface Courses {
    courses: CoursePart[];
}

const Content = (props: Courses) => {
    const courses = props.courses;
    return (
        <div>
            {courses.map((c) => (
                <Part key={c.name} course={c} />
            ))}
        </div>
    );
};

export default Content;
