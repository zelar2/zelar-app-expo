import { supabase } from "@/integrations/supabase/client";

type QueryResult<T = unknown> = {
  data: T;
  error: Error | null;
  count?: number | null;
};

type LooseQuery = {
  select: (...args: unknown[]) => LooseQuery;
  insert: (payload: unknown) => Promise<QueryResult>;
  update: (payload: unknown) => LooseQuery;
  delete: () => LooseQuery;
  eq: (column: string, value: unknown) => LooseQuery;
  order: (column: string, options?: unknown) => LooseQuery;
  limit: (count: number) => LooseQuery;
  maybeSingle: () => Promise<QueryResult>;

  then: <TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;

  catch: <TResult = never>(
    onrejected?: ((reason: unknown) => TResult | PromiseLike<TResult>) | null
  ) => Promise<QueryResult | TResult>;

  finally: (onfinally?: (() => void) | null) => Promise<QueryResult>;
};

export function fromTable(table: string): LooseQuery {
  return supabase.from(table as never) as unknown as LooseQuery;
}
