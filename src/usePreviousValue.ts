import { useEffect, useRef } from "react";

/**
 * Stores the value for the current render and provides the one from the previous one.
 * 
 * @param value anything
 * @returns 
 */
export const usePreviousValue = <T>(value: T) => {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

/**
 * Will return true if the value changed between the previous render and the current one.
 * 
 * @param value anything
 * @returns 
 */
export const useValueChanged = <T>(currValue: T) => {
    return usePreviousValue(currValue) !== currValue;
}
