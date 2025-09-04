#!/usr/bin/env node

import { Command } from "commander";
import { SlackNotifier } from "./slack-notifier";
import { HolidayChecker } from "./holiday-checker";
import { config } from "./config";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import * as fs from "fs";
import * as path from "path";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("ja");
dayjs.tz.setDefault("Asia/Tokyo");

// Execution time management
interface ExecutionRecord {
  start?: string;
  end?: string;
}

class ExecutionGuard {
  private readonly logPath: string;

  constructor() {
    this.logPath = path.join(__dirname, "../logs/last-execution.json");
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private loadExecutionRecord(): ExecutionRecord {
    try {
      if (fs.existsSync(this.logPath)) {
        const data = fs.readFileSync(this.logPath, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      console.log(`⚠️ Could not load execution record: ${error}`);
    }
    return {};
  }

  private saveExecutionRecord(record: ExecutionRecord): void {
    try {
      this.ensureLogDirectory();
      fs.writeFileSync(this.logPath, JSON.stringify(record, null, 2));
    } catch (error) {
      console.error(`❌ Could not save execution record: ${error}`);
    }
  }

  private isInTimeWindow(commandType: "start" | "end"): boolean {
    const now = dayjs.tz();
    const hour = now.hour();

    if (commandType === "start") {
      // Allow execution between 8:30 and 9:30
      return hour >= 8 && (hour < 9 || (hour === 9 && now.minute() <= 30));
    } else {
      // Allow execution between 18:00 and 18:59
      return hour === 18;
    }
  }

  private wasRecentlyExecuted(commandType: "start" | "end"): boolean {
    const record = this.loadExecutionRecord();
    const lastExecutionStr =
      commandType === "start" ? record.start : record.end;

    if (!lastExecutionStr) {
      return false;
    }

    const lastExecution = dayjs.tz(lastExecutionStr);
    const now = dayjs.tz();

    // Check if already executed today
    return lastExecution.isSame(now, "day");
  }

  shouldExecute(commandType: "start" | "end"): boolean {
    // Check if in appropriate time window
    if (!this.isInTimeWindow(commandType)) {
      const now = dayjs.tz();
      const timeWindow =
        commandType === "start" ? "08:30-09:30" : "18:00-18:59";
      console.log(
        `⏰ Current time (${now.format(
          "HH:mm"
        )}) is outside the execution window (${timeWindow}). Skipping execution to prevent catch-up from sleep/shutdown.`
      );
      return false;
    }

    // Check if already executed today
    if (this.wasRecentlyExecuted(commandType)) {
      console.log(
        `✋ ${commandType} command already executed today. Skipping to prevent duplicate execution.`
      );
      return false;
    }

    return true;
  }

  recordExecution(commandType: "start" | "end"): void {
    const record = this.loadExecutionRecord();
    const now = dayjs.tz().toISOString();

    if (commandType === "start") {
      record.start = now;
    } else {
      record.end = now;
    }

    this.saveExecutionRecord(record);
    console.log(
      `📝 Recorded ${commandType} execution at ${dayjs
        .tz(now)
        .format("YYYY-MM-DD HH:mm:ss")}`
    );
  }
}

// Random sleep function (1-5 minutes)
const randomSleep = (): Promise<void> => {
  const minSeconds = 60; // 1 minute
  const maxSeconds = 300; // 5 minutes
  const randomSeconds = Math.floor(
    Math.random() * (maxSeconds - minSeconds) + minSeconds
  );

  const minutes = Math.floor(randomSeconds / 60);
  const seconds = randomSeconds % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  console.log(`⏰ Waiting ${timeStr} before sending notification...`);

  return new Promise((resolve) => {
    setTimeout(resolve, randomSeconds * 1000);
  });
};

const program = new Command();

program
  .name("slack-work")
  .description("CLI app to send work start/end notifications to Slack")
  .version("1.0.0");

program
  .command("start")
  .description("Send work start notification to Slack")
  .option("-m, --message <message>", "Custom message to include")
  .action(async (options) => {
    try {
      const executionGuard = new ExecutionGuard();

      // Check execution guard (time window and duplicate execution)
      if (!executionGuard.shouldExecute("start")) {
        return;
      }

      // Check if today is a holiday
      const holidayChecker = new HolidayChecker();
      const today = dayjs.tz().format("YYYY-MM-DD");

      if (holidayChecker.isTodayHoliday()) {
        console.log(
          `🎌 Today (${today}) is a holiday. Skipping work start notification.`
        );
        return;
      }

      // Random sleep (1-5 minutes) to avoid simultaneous execution
      await randomSleep();

      const notifier = new SlackNotifier();
      const message = options.message || config.startDefaultMessage;

      await notifier.sendNotification(message);

      // Record successful execution
      executionGuard.recordExecution("start");

      console.log("✅ Work start notification sent successfully!");
    } catch (error) {
      console.error("❌ Error sending notification:", error);
      process.exit(1);
    }
  });

program
  .command("end")
  .description("Send work end notification to Slack")
  .option("-m, --message <message>", "Custom message to include")
  .action(async (options) => {
    try {
      const executionGuard = new ExecutionGuard();

      // Check execution guard (time window and duplicate execution)
      if (!executionGuard.shouldExecute("end")) {
        return;
      }

      // Check if today is a holiday
      const holidayChecker = new HolidayChecker();
      const today = dayjs.tz().format("YYYY-MM-DD");

      if (holidayChecker.isTodayHoliday()) {
        console.log(
          `🎌 Today (${today}) is a holiday. Skipping work end notification.`
        );
        return;
      }

      // Random sleep (1-5 minutes) to avoid simultaneous execution
      await randomSleep();

      const notifier = new SlackNotifier();
      const message = options.message || config.endDefaultMessage;

      await notifier.sendNotification(message);

      // Record successful execution
      executionGuard.recordExecution("end");

      console.log("✅ Work end notification sent successfully!");
    } catch (error) {
      console.error("❌ Error sending notification:", error);
      process.exit(1);
    }
  });

program
  .command("status")
  .description("Check Slack connection status and holiday information")
  .action(async () => {
    try {
      // Check holiday status
      const holidayChecker = new HolidayChecker();
      const today = dayjs.tz().format("YYYY-MM-DD");
      const isHoliday = holidayChecker.isTodayHoliday();

      console.log(`📅 Today: ${today} (${dayjs.tz().format("dddd")})`);
      console.log(
        `🎌 Holiday status: ${
          isHoliday ? "Yes, today is a holiday!" : "No, today is not a holiday."
        }`
      );
      console.log(
        `📊 Total holidays loaded: ${holidayChecker.getHolidayCount()}`
      );
      console.log();

      // Check Slack connection
      const notifier = new SlackNotifier();
      await notifier.checkConnection();
      console.log("✅ Slack connection is working!");
    } catch (error) {
      console.error("❌ Slack connection failed:", error);
      process.exit(1);
    }
  });

program.parse();
