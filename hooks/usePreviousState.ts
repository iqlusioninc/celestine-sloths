import { useEffect, useRef } from "react";

export const usePreviousState = <T>(value: T): T | undefined => {
    const prevValueRef = useRef<T | undefined>(undefined);

    useEffect(() => {
        prevValueRef.current = value;
    }, [value]);

    return prevValueRef.current;
};
