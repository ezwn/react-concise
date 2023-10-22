import { useCallback } from "react";

export function createChildState<P, C>(
    useParentState: () => [P, React.Dispatch<React.SetStateAction<P>>],
    extractChildValue: (p: P) => C,
    injectChildValue: (p: P, t: C) => P,
) {
    return (): [C, React.Dispatch<React.SetStateAction<C>>] => {
        const [lastRefreshParentState, setParentState] = useParentState();

        const setChildState = useCallback((action: React.SetStateAction<C>) => {
            setParentState(currentParentState => {
                let currChildValue: C = extractChildValue(currentParentState);
                let nextChildValue: C;
                if (typeof action === 'function') {
                    const fn = action as (prevChildState: C) => C;
                    nextChildValue = fn(currChildValue);
                } else {
                    nextChildValue = action as C;
                }

                if (nextChildValue !== currChildValue)
                    return injectChildValue(currentParentState, nextChildValue);
                else
                    return currentParentState;
            });
        }, [setParentState]);

        return [extractChildValue(lastRefreshParentState), setChildState];
    }
};
