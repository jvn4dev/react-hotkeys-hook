import React, {useState} from "react";
import {Options, useHotkeys} from "./index";
import {act, renderHook} from "@testing-library/react-hooks";
import { fireEvent } from "@testing-library/react";

function useWrapper(keys: string) {
  const [count, setCount] = useState(0);
  const increment = () => setCount((x) => x + 1);

  useHotkeys(keys, increment);

  return count;
}

function useDeps(setDeps: boolean) {
  const [count, setCount] = useState(0);
  const increment = () => setCount(count + 1);

  useHotkeys('a', increment, {}, setDeps ? [count] : []);

  return count;
}

test('useHotkeys should listen to key presses', () => {
    const { result } = renderHook(() => useWrapper('a'));

    expect(result.current).toBe(0);

    act(() => {
      fireEvent.keyDown(document.body, { key: 'a', keyCode: 65 });

      return undefined;
    });

    expect(result.current).toBe(1);
});

test('useHotkeys should listen to its own context', function () {
  const resultA = renderHook(() => useWrapper('a'));
  const resultB = renderHook(() => useWrapper('b'));

  act(() => {
    fireEvent.keyDown(document.body, { key: 'a', keyCode: 65 });

    return undefined;
  });

  expect(resultA.result.current).toBe(1);
  expect(resultB.result.current).toBe(0);
});

test('useHotkeys should rebuild callback after deps change', function () {
  const resultA = renderHook(() => useDeps(false));
  const resultB = renderHook(() => useDeps(true));

  act(() => {
    fireEvent.keyDown(document.body, { key: 'a', keyCode: 65 });

    return undefined;
  });

  expect(resultA.result.current).toBe(1);
  expect(resultB.result.current).toBe(1);

  act(() => {
    fireEvent.keyDown(document.body, { key: 'a', keyCode: 65 });

    return undefined;
  });

  expect(resultA.result.current).toBe(1);
  expect(resultB.result.current).toBe(2);
});