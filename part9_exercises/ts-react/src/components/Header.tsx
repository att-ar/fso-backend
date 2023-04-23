interface CourseName {
    name: string;
}
const Header = (props: CourseName) => <h1>{props.name}</h1>;

export default Header;
