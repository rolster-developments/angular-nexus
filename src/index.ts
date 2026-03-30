import { Signal, WritableSignal, computed, signal } from '@angular/core';
import { freeze } from '@rolster/commons';

export type Reducer<T> = (value: Readonly<T>) => T;
export type Selector<T, V> = (value: Readonly<T>) => V;

class State<T extends LiteralObject> {
  private readonly _signal: WritableSignal<Readonly<T>>;

  private readonly _initial: Readonly<T>;

  constructor(value: T) {
    this._initial = freeze(value);
    this._signal = signal<Readonly<T>>(this._initial);
  }

  public get value(): Signal<Readonly<T>> {
    return this._signal.asReadonly();
  }

  public reset(): void {
    this._signal.set(this._initial);
  }

  public reduce(reducer: Reducer<T>): void {
    this._signal.update(reducer);
  }

  public select<V>(selector: Selector<T, V>): Signal<V> {
    return computed(() => selector(this._signal()));
  }
}

export abstract class AbstractStore<T extends LiteralObject> {
  abstract readonly value: Signal<Readonly<T>>;

  abstract reset(): void;
}

export type StoreSignals<T extends LiteralObject> = {
  readonly [K in keyof T]-?: Signal<T[K]>;
};

export class Store<T extends LiteralObject> implements AbstractStore<T> {
  protected readonly _signals: StoreSignals<T>;

  private readonly _state: State<T>;

  private readonly _cache: Map<keyof T, Signal<any>> = new Map();

  constructor(value: T) {
    this._state = new State(value);

    this._signals = new Proxy({} as StoreSignals<T>, {
      get: (_target, prop: string | symbol) => {
        if (typeof prop !== 'string') {
          return undefined;
        }

        const key = prop as keyof T;

        if (!this._cache.has(key)) {
          this._cache.set(
            key,
            computed(() => this._state.value()[key])
          );
        }

        return this._cache.get(key);
      }
    });
  }

  public get value(): Signal<Readonly<T>> {
    return this._state.value;
  }

  public get signals(): StoreSignals<T> {
    return this._signals;
  }

  public reset(): void {
    this._state.reset();
  }

  protected reduce(reducer: Reducer<T>): void {
    this._state.reduce(reducer);
  }

  protected select<V>(selector: Selector<T, V>): Signal<V> {
    return this._state.select(selector);
  }
}
