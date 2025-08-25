type Ok<V> = { success: true, data: V };
type Err = { success: false, error: string };
export type Result<V> =
    | Ok<V>
    | Err;
export const isOk = <V>(r: Result<V>): r is Ok<V> => r.success;