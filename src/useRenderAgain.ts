import { useCallback, useState } from "react";

export const useRenderAgain = (max = 5) => {
    const [renderCount, setRenderCount] = useState(0);

    return useCallback(() => {
        if (max === 0 || renderCount < max) {
            setRenderCount(renderCount + 1);
        }
    }, [renderCount, max]);
}
