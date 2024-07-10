import classNames from "classnames";

type V2IconProps = {
    size?: string;
    innerClassNames?: string;
    className?: string;
};

export default function Spinner({
    size = "36",
    className,
    innerClassNames = "stroke-primary",
}: V2IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={classNames("animate-spin", className)}
        >
            <path
                d="M40 17C44.549 17 48.9958 18.3489 52.7781 20.8762C56.5604 23.4035 59.5084 26.9956 61.2492 31.1983C62.99 35.401 63.4455 40.0255 62.5581 44.4871C61.6706 48.9486 59.4801 53.0468 56.2635 56.2635C53.0468 59.4801 48.9486 61.6706 44.4871 62.5581C40.0255 63.4455 35.401 62.99 31.1983 61.2492C26.9956 59.5084 23.4035 56.5604 20.8762 52.7781C18.3489 48.9958 17 44.549 17 40"
                className={innerClassNames}
                stroke="#29A874"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
