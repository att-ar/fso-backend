type Course = { name: string; exerciseCount: number };
export interface Courses {
    courses: Course[];
}

const Content = (props: Courses) => {
    const courses = props.courses;
    return (
        <div>
            {courses.map((c) => (
                <p key={c.name}>
                    {c.name} {c.exerciseCount}
                </p>
            ))}
        </div>
    );
};

export default Content;
