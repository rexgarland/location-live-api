interface Subscriber<T> {
    next(v: T): void,

    error(e: T): void,

    complete(): void,
}

export class Observable<T> {
    subscribe: (sub: Partial<Subscriber<T>>) => void | Promise<void>;

    constructor(subscribe: (sub: Subscriber<T>) => void | Promise<void>) {
        this.subscribe = (partialSubscriber) => {
            const {next, error, complete} = partialSubscriber;

            const properSubscriber: Subscriber<T> = {
                next: (v) => next?.(v),
                error: (v) => error?.(v),
                complete: () => complete?.(),
            };

            return subscribe(properSubscriber)
        }
    }
}