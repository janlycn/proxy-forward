"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodeSchedule = require("node-schedule");
function singleScheduleJob(rule, cb) {
    let running = false;
    const done = () => {
        running = false;
    };
    return nodeSchedule.scheduleJob(rule, () => {
        if (running)
            return;
        running = true;
        try {
            cb(done);
        }
        catch (e) {
            done();
            console.error(e);
        }
    });
}
exports.singleScheduleJob = singleScheduleJob;
//# sourceMappingURL=index.js.map