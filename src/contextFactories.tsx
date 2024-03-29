import React, { useContext, useEffect, useState } from "react";
import { ChildrenProps } from "./ChildrenProps";

export class RenderSuspendedException extends Error { }

/**
 * Creates a context taking P as input and providing V.
 * The "valueProvider" function has to be defined.
 * 
 * If <initialValue> is undefined, it is mandatory to use the provider.
 */
export function createSimpleContext<P, V>(
  valueProvider: (props: P) => V,
  initialValue?: V,
) {
  const Context = React.createContext<V>(initialValue!);

  const Provider: React.FC<P & ChildrenProps> = (props) => {
    try {
      const value = valueProvider(props);

      return (<Context.Provider value={value}>
        {props.children}
      </Context.Provider>);
    } catch (RenderSuspendedException) {
      return null;
    }
  };

  const MockProvider: React.FC<{ mock: V } & ChildrenProps> = ({ mock, children }) => {
    return (<Context.Provider value={mock}>
      {children}
    </Context.Provider>);
  };

  return {
    MockProvider,
    Provider,
    useContext: () => {
      const value = useContext(Context);

      if (value === undefined) {
        throw ("<undefined> is a reserved value for this type of context. This means you might have forgotten to define a provider. If you want to return nothing, use <null> instead of <undefined>.")
      }

      return value;
    }
  };
}

/**
 * Creates a context broadcasting its props as value.
 * 
 * If <initialValue> is undefined, it is mandatory to use the provider.
 */
export function createBroadcastContext<T>(defaultValue?: T) {
  return createSimpleContext<T, T>(t => t, defaultValue);
}

/**
 * Creates a context broadcasting a state array: [state, setState].
 */
export function createStateContext<T>(moduleName: string, initialValue: T) {
  return createSimpleContext(
    () => useState<T>(initialValue),
    [initialValue, dontCallMeFn(`default ${moduleName} setter`)],
  );
}

/**
 * Creates a context broadcasting a state updated by a provided sync method.
 */

export const NEVER_REPEAT = 0;
export type SYNC_STATE_STATUS = 'UNINITIALIZED' | 'SYNCING' | 'READY';

export interface StatusRouterProps extends ChildrenProps {
  uninitialized?: React.ReactNode;
  syncing?: React.ReactNode;
}

export function createSynchronizedStateContext<S, P = unknown>(
  useSyncFn: (props: P) => () => Promise<S>,
  initialValue: S,
  syncRepeatPeriod = NEVER_REPEAT
) {

  const useValue = (props: P) => {
    const [value, setValue] = useState<S>(initialValue);
    const [status, setStatus] = useState<SYNC_STATE_STATUS>('UNINITIALIZED');
    const syncFn = useSyncFn(props);

    useEffect(() => {
      async function synchronize() {
        setStatus('SYNCING');
        setValue(await syncFn());
        setStatus('READY');
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

    return { value, status };
  };

  const context = createSimpleContext(
    useValue,
    { value: initialValue, status: 'UNINITIALIZED' },
  );

  const StatusRouter: React.FC<StatusRouterProps> = ({ children, uninitialized, syncing }) => {
    const { status } = context.useContext();
    switch (status) {
      case 'READY':
        return <>{children}</>;
      case 'UNINITIALIZED':
        return <>{uninitialized || syncing}</>;
      case 'SYNCING':
        return <>{syncing}</>;
      default:
        return undefined;
    }
  }

  return { ...context, StatusRouter };
}

const dontCallMeFn = (name: string) => () => {
  console.error(`${name} shouldn't be called`)
};
