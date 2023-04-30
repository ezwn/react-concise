import React from "react";

export function createValueFilter(useValue: () => unknown, predicate: (val: unknown) => boolean): React.FC<{ children: JSX.Element }> {
    return ({ children }) => {
        const value = useValue();

        if (predicate(value)) {
            return <>{children}</>;
        } else {
            return null;
        }
    }
}

export function createMissingValueFilter(useValue: () => unknown): React.FC<{ children: JSX.Element }> {
    return createValueFilter(useValue, (val: unknown) => !val);
}


export function createExistingValueFilter(useValue: () => unknown): React.FC<{ children: JSX.Element }> {
    return createValueFilter(useValue, (val: unknown) => !!val);
}
