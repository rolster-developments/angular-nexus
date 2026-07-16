import { describe, it, expect } from 'vitest';

import { Store } from './index';

describe('Store (Angular)', () => {
  interface TestState {
    count: number;
    name: string;
  }

  function createStore(initial?: Partial<TestState>) {
    return new Store<TestState>({
      count: 0,
      name: 'test',
      ...initial
    });
  }

  describe('value', () => {
    it('should return a signal with initial value', () => {
      const store = createStore();

      expect(store.value()).toEqual({ count: 0, name: 'test' });
    });
  });

  describe('setValue', () => {
    it('should merge partial values', () => {
      const store = createStore();

      store.setValue({ count: 5 });

      expect(store.value()).toEqual({ count: 5, name: 'test' });
    });
  });

  describe('signals', () => {
    it('should provide individual signals per key', () => {
      const store = createStore({ count: 10, name: 'hello' });

      expect(store.signals.count()).toBe(10);
      expect(store.signals.name()).toBe('hello');
    });

    it('should update signals when value changes', () => {
      const store = createStore();

      store.setValue({ count: 42 });

      expect(store.signals.count()).toBe(42);
    });
  });

  describe('reset', () => {
    it('should reset to initial value', () => {
      const store = createStore();

      store.setValue({ count: 99 });
      store.reset();

      expect(store.value()).toEqual({ count: 0, name: 'test' });
    });
  });
});
