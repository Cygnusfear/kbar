import React from "react";
import { KBarContext } from "./KBarContextProvider";
import type { ActionTree, KBarQuery, KBarState } from "./types";

interface BaseKBarReturnType {
  query: KBarQuery;
  options: any;
  actions: ActionTree;
}

type useKBarReturnType<S = null> = S extends null
  ? BaseKBarReturnType
  : S & BaseKBarReturnType;

export default function useKBar<C = null>(
  collector?: (state: KBarState) => C
): useKBarReturnType<C> {
  const { query, getState, subscribe, options, actions } =
    React.useContext(KBarContext);

  const collected = React.useRef(collector?.(getState()));
  const collectorRef = React.useRef(collector);

  const onCollect = React.useCallback(
    (collected: any) => ({
      ...collected,
      query,
      options,
      actions,
    }),
    [query, options, actions]
  );

  const [render, setRender] = React.useState(onCollect(collected.current));

  React.useEffect(() => {
    let unsubscribe;
    if (collectorRef.current) {
      unsubscribe = subscribe(
        (current) => (collectorRef.current as any)(current),
        (collected) => setRender(onCollect(collected))
      );
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [onCollect, subscribe]);

  return render;
}
