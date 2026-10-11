const HeartSvg = ({
    width = 64,
    height = 64,
    color = "#F4A6C5",
    className = "",
    style = {},
    ...props
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
            {...props}
        >
            <path
                d="M33.5 54 C29 47 22 42 15.5 35 C8 27 10 18 17 15 C24 12 30 17 33 23 C35 14 41 9 48 12 C56 16 53 27 49 36 C45 44 38 51 33.5 54Z"
                fill={color}
            />
        </svg>
    );
};

export default HeartSvg;