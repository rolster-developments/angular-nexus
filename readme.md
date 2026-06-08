# Rolster Angular Store

Library that allows you to manage the status of Angular applications.

## Installation

```
npm i @rolster/angular-store
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
The state is immutable (frozen) and exposed as read-only `Signal`s, so it plugs
straight into templates, `computed` and `effect` with zero boilerplate.

> Requires Angular 19+ (`@angular/core` is a peer dependency).

### Basic usage

```typescript
import { Store } from '@rolster/angular-store';

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

`store.signals` exposes one memoized `Signal` per state field, so a component
only re-renders when the field it actually reads changes:

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

Extend `Store` to encapsulate domain logic. The protected `reduce` and `select`
methods build updates and derived (`computed`) signals:

```typescript
import { Injectable } from '@angular/core';
import { Store } from '@rolster/angular-store';

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

## Related

- [`@rolster/reactive-store`](https://www.npmjs.com/package/@rolster/reactive-store)
  — the same API for framework-agnostic projects (built on observables instead
  of Angular signals).

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
