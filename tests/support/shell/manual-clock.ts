import type { DayClock } from "../../../src/infrastructure/obsidian/shell/today";

type Timer = { readonly at: number; readonly run: () => void };

/**
 * A clock and timers a test moves by hand, for the Obsidian `Today` adapter. Two times, as on a real
 * machine: the clock (`now`), which a person or a sync can set, and the awake time that timers
 * count. `advance` moves both and runs every timer that falls due, in order; `setClock` moves only
 * the clock; `sleep` moves only the clock too, because a timer does not count the time the machine
 * sleeps and fires late after it wakes.
 */
export const manualClock = (start: Date) => {
  let clock = start.getTime();
  let awake = 0;
  let nextId = 1;
  const timers = new Map<number, Timer>();

  const due = (end: number): [number, Timer] | undefined => {
    let first: [number, Timer] | undefined;
    for (const entry of timers) {
      if (entry[1].at <= end && (first === undefined || entry[1].at < first[1].at)) first = entry;
    }
    return first;
  };

  const dayClock: DayClock = {
    now: () => new Date(clock),
    setTimeout: (run, ms) => {
      const id = nextId;
      nextId += 1;
      timers.set(id, { at: awake + ms, run });
      return id;
    },
    clearTimeout: (id) => {
      timers.delete(id);
    },
  };

  return {
    clock: dayClock,
    /** `ms` pass, awake: the clock moves on and each timer that falls due runs, in order. */
    advance: (ms: number): void => {
      const end = awake + ms;
      for (let next = due(end); next !== undefined; next = due(end)) {
        const [id, timer] = next;
        clock += timer.at - awake;
        awake = timer.at;
        timers.delete(id);
        timer.run();
      }
      clock += end - awake;
      awake = end;
    },
    /** The system clock is set to `time`; no timer notices. */
    setClock: (time: Date): void => {
      clock = time.getTime();
    },
    /** The machine sleeps for `ms`: the clock moves on, the timers wait. */
    sleep: (ms: number): void => {
      clock += ms;
    },
    /** The delays of the timers still pending, from now in awake time. */
    pending: (): number[] => [...timers.values()].map((timer) => timer.at - awake),
  };
};
