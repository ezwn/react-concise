import { useEffect, useRef } from "react";

export const usePreviousValue = <T>(props: T) => {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = props;
    });
    return ref.current;
}

