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

export class Store<T extends LiteralObject> implements AbstractStore<T> {
  private readonly _state: State<T>;

  constructor(value: T) {
    this._state = new State(value);
  }

  public get value(): Signal<Readonly<T>> {
    return this._state.value;
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
