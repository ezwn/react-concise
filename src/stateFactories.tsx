import { useCallback, useMemo } from "react";

export const jsEquality = (c1: unknown, c2: unknown) => c1 === c2

export type StateAdapter<P, C> = [
    (p: P) => C, // extractChildValue
    (p: P, t: C) => P, // injectChildValue
    (c1: C, c2: C) => boolean // childEqualityFn
];

export const useStateAdapter = <P, C>(
    extractChildValue: (p: P) => C,
    injectChildValue: (p: P, t: C) => P,
    childEqualityFn: (c1: C, c2: C) => boolean = jsEquality
): StateAdapter<P, C> => useMemo(
    () => [extractChildValue, injectChildValue, childEqualityFn],
    [extractChildValue, injectChildValue, childEqualityFn]);

export function useSetChildState<P, C>(
    setParentState: React.Dispatch<React.SetStateAction<P>>,
    [extractChildValue, injectChildValue, childEqualityFn]: StateAdapter<P, C>
): React.Dispatch<React.SetStateAction<C>> {
    return useCallback((action: React.SetStateAction<C>) => {
        setParentState(currentParentState => {
            let currChildValue: C = extractChildValue(currentParentState);
            let nextChildValue: C;
            if (typeof action === 'function') {
                const fn = action as (prevChildState: C) => C;
                nextChildValue = fn(currChildValue);
            } else {
                nextChildValue = action as C;
            }

            if (!childEqualityFn(nextChildValue, currChildValue)) {
                return injectChildValue(currentParentState, nextChildValue);
            } else
                return currentParentState;
        });
    }, [setParentState, extractChildValue, injectChildValue, childEqualityFn]);
}

export function useChildState<P, C>(
    parentState: [P, React.Dispatch<React.SetStateAction<P>>],
    stateAdapter: StateAdapter<P, C>
): [C, React.Dispatch<React.SetStateAction<C>>] {
    const [lastRefreshParentState, setParentState] = parentState;
    const [extractChildValue] = stateAdapter;
    return [extractChildValue(lastRefreshParentState), useSetChildState(setParentState, stateAdapter)];
}
