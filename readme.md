# Rolster Angular Nexus

Library that allows you to manage the status of Angular applications.

## Installation

```
npm i @rolster/angular-nexus
```

## Configuration

You must install the `@rolster/types` to define package data types, which are configured by adding them to the `files` property of the `tsconfig.json` file.

```json
{
  "files": ["node_modules/@rolster/types/index.d.ts"]
}
```

## Features

A state container for Angular built on native [signals](https://angular.dev/guide/signals).
The initial state is frozen and the whole state is exposed as read-only
`Signal`s, so it plugs straight into templates, `computed` and `effect` with
zero boilerplate. Values produced by `setValue` and `reduce` are stored as they
are returned (they are not frozen).

> Requires Angular 20, 21 or 22. `@angular/core` is declared as a regular
> dependency of the package (`^20.0.0 || ^21.0.0 || ^22.0.0`), not as a peer
> dependency.

### Basic usage

```typescript
import { Store } from '@rolster/angular-nexus';

interface CounterState {
  count: number;
  step: number;
}

const store = new Store<CounterState>({ count: 0, step: 1 });

// `value` is a Signal<Readonly<CounterState>>
store.value(); // { count: 0, step: 1 }

// Partial update (shallow merge)
store.setValue({ count: 5 });

// Back to the initial state
store.reset();
```

### Per-field signals

`store.signals` (a `StoreSignals<T>`) exposes one memoized `Signal` per state
field, so a component only re-renders when the field it actually reads changes:

```typescript
@Component({
  template: `
    <p>Count: {{ count() }}</p>
    <button (click)="increment()">+</button>
  `
})
export class CounterComponent {
  private store = new Store<CounterState>({ count: 0, step: 1 });

  protected count = this.store.signals.count; // Signal<number>

  protected increment(): void {
    this.store.setValue({ count: this.count() + 1 });
  }
}
```

### Custom stores with actions

Extend `Store` to encapsulate domain logic. The protected
`reduce(reducer: Reducer<T>)` and `select(selector: Selector<T, V>)` methods
build updates and derived (`computed`) signals:

```typescript
import { Injectable } from '@angular/core';
import { Store } from '@rolster/angular-nexus';

interface Product {
  name: string;
  price: number;
}

interface CartState {
  items: Product[];
}

@Injectable({ providedIn: 'root' })
export class CartStore extends Store<CartState> {
  // Derived signal — recomputes only when `items` changes
  public readonly total = this.select((state) =>
    state.items.reduce((sum, item) => sum + item.price, 0)
  );

  constructor() {
    super({ items: [] });
  }

  public addItem(product: Product): void {
    this.reduce((state) => ({ items: [...state.items, product] }));
  }
}
```

`total` is a `Signal<number>` you can read directly in a template
(`{{ store.total() }}`).

### Types

| Type               | Description                                                                                                                        |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `AbstractStore<T>` | Abstract contract implemented by `Store`: `value` (a `Signal<Readonly<T>>`) and `reset()`. Depend on it when injecting a store.    |
| `StoreSignals<T>`  | Return type of `store.signals`: one `Signal<T[K]>` per key `K` of the state.                                                       |
| `Reducer<T>`       | `(value: Readonly<T>) => T` — builds the next state from the current one; argument of `reduce`.                                    |
| `Selector<T, V>`   | `(value: Readonly<T>) => V` — derives a value from the current state; argument of `select`, which wraps it in a `computed` signal. |

## Related

- [`@rolster/nexus`](https://www.npmjs.com/package/@rolster/nexus)
  — the same concepts, adapted to observables instead of Angular signals, for
  framework-agnostic projects (its `Store` exposes `subscribe` / `listen` and a
  plain `value`).

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
