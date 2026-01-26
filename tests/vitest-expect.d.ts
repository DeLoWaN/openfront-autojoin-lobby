import type { Assertion, JestAssertion } from '@vitest/expect';

declare module '@vitest/expect' {
  interface ExpectStatic {
    <T>(actual: T, message?: string): Assertion<T> & JestAssertion<T>;
  }
}
