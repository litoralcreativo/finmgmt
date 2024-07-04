import cron from "node-cron";
import axios from "axios";
import { BehaviorSubject } from "rxjs";

const apiUrl = /* process.env.API_URI ||  */ "http://localhost:3000";

export type CronTask = {
  schedule: string;
  callback: () => void;
  running?: boolean;
};

export class CronService {
  _tasks: Map<string, CronTask> = new Map();
  constructor() {
    this._setDummyTask();
  }
  private _setDummyTask() {
    const dummytask: CronTask = {
      schedule: "*/12 * * * *",
      callback: () => {
        const dateStart: Date = new Date();
        axios
          .get(`${apiUrl}/dummy`)
          .then((res) => {
            const dateEnd: Date = new Date();
            console.info(`Dummy response OK: ${dateEnd.toLocaleString()}`);
          })
          .catch((err) => {
            const dateEnd: Date = new Date();
            console.info(`Dummy response ERROR: ${dateEnd.toLocaleString()}`);
          });
      },
    };
    this.addTask("dummyTask", dummytask, true);
  }

  addTask(taskId: string, task: CronTask, execute: boolean = false): boolean {
    if (this._tasks.has(taskId)) return false;

    this._tasks.set(taskId, task);
    if (execute) {
      const executed = this.startTask(taskId);
      if (!executed) throw new Error(`Culdn't execute task ${taskId}`);
    }
    return true;
  }

  startTask(taskId: string, runOnInit: boolean = true): boolean {
    if (!this._tasks.has(taskId)) return false;

    const task: CronTask = this._tasks.get(taskId)!;
    if (task.running) return false;

    cron.schedule(task.schedule, task.callback, {
      runOnInit: runOnInit,
    });
    return true;
  }
}

export const cronService: CronService = new CronService();
