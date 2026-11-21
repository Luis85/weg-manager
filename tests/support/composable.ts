import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import type { AppRuntime } from "../../src/application/app-services";
import { provideRuntime } from "../../src/presentation/shell/runtime/use-runtime";
import { testRuntime, type TestRuntimeOptions } from "./runtime";

/** Runs `setup` inside a mounted component on `runtime` and hands back what it returned. */
export const host = <T>(runtime: AppRuntime, setup: () => T) => {
  let exposed: T | undefined;
  const wrapper = mount(
    defineComponent({
      setup() {
        exposed = setup();
        return () => h("div");
      },
    }),
    { global: { plugins: [{ install: (app) => provideRuntime(app, runtime) }] } },
  );
  if (exposed === undefined) throw new Error("setup did not run");
  return { wrapper, exposed };
};

/** Test runtimes that `disposeAll()` disposes, for an `afterEach`. */
export const runtimes = () => {
  const made: AppRuntime[] = [];
  return {
    make: (options: TestRuntimeOptions = {}) => {
      const test = testRuntime(options);
      made.push(test.runtime);
      return test;
    },
    disposeAll: () => Promise.all(made.splice(0).map((runtime) => runtime.dispose())),
  };
};
