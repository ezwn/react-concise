import React, { useContext, useEffect, useState } from "react";

export class RenderSuspendedException extends Error { }

/**
 * Creates a context taking P as input and providing V.
 * The "valueProvider" function has to be defined.
 */
export function createSimpleContext<P, V>(
  initialValue: V,
  valueProvider: (props: P) => V
) {
  const Context = React.createContext<V>(initialValue);

  const Provider: React.FC<P> = (props) => {
    try {
      const value = valueProvider(props);

      return (<Context.Provider value={value}>
        {props.children}
      </Context.Provider>);
    } catch (RenderSuspendedException) {
      return null;
    }
  };

  const MockProvider: React.FC<{ mock: V }> = ({ mock, children }) => {
    return (<Context.Provider value={mock}>
      {children}
    </Context.Provider>);
  };

  return {
    MockProvider,
    Provider,
    useContext: () => useContext(Context)
  };
}

/**
 * Creates a context broadcasting its props as value.
 */
export function createBroadcastContext<T>(initialValue: T) {
  return createSimpleContext<T, T>(initialValue, t => t);
}

/**
 * Creates a context broadcasting a state array: [state, setState].
 */
export function createStateContext<T>(defaultValue: T, moduleName: string) {
  return createSimpleContext(
    [defaultValue, dontCallMeFn(`default ${moduleName} setter`)],
    () => useState<T>(defaultValue)
  );
}

/**
 * Creates a context broadcasting a state updated by a provided sync method.
 */

export const NEVER_REPEAT = 0;

export function createSynchronizedStateContext<S, P = unknown>(
  initialValue: S,
  useSyncFn: () => (props: P) => Promise<S>,
  syncRepeatPeriod = NEVER_REPEAT
) {

  const useValue = (props: P) => {
    const [state, setState] = useState<S>(initialValue);
    const syncFn = useSyncFn();

    useEffect(() => {
      async function synchronize() {
        setState(await syncFn(props));
      }

      synchronize();

      if (syncRepeatPeriod !== NEVER_REPEAT) {
        const interval = setInterval(synchronize, syncRepeatPeriod);

        return () => {
          if (interval) {
            clearInterval(interval);
          }
        };
      }
    }, [syncFn]);

    return state;
  };

  return createSimpleContext(
    initialValue,
    useValue,
  );
}

const dontCallMeFn = (name: string) => () => { 
  console.error(`${name} shouldn't be called`)
};
