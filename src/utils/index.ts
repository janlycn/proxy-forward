import * as nodeSchedule from 'node-schedule';

export function singleScheduleJob(rule, cb: (done: () => void) => {}) {
  let running = false;
  const done = () => {
    running = false;
  };
  return nodeSchedule.scheduleJob(rule, () => {
    if (running) return;
    running = true;

    try {
      cb(done);
    } catch (e) {
      done();
      console.error(e);
    }
  });
}
