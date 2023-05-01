import React from "react";
import { ChildrenProps } from "./ChlidrenProps";

export function createValueFilter(useValue: () => unknown, predicate: (val: unknown) => boolean): React.FC<ChildrenProps> {
    return ({ children }) => {
        const value = useValue();

        if (predicate(value)) {
            return <>{children}</>;
        } else {
            return null;
        }
    }
}

export function createMissingValueFilter(useValue: () => unknown): React.FC<ChildrenProps> {
    return createValueFilter(useValue, (val: unknown) => !val);
}


export function createExistingValueFilter(useValue: () => unknown): React.FC<ChildrenProps> {
    return createValueFilter(useValue, (val: unknown) => !!val);
}
