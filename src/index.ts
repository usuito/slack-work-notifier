#!/usr/bin/env node

import { Command } from "commander";
import { SlackNotifier } from "./slack-notifier";
import { HolidayChecker } from "./holiday-checker";
import { config } from "./config";
import dayjs from "dayjs";
import "dayjs/locale/ja";

dayjs.locale("ja");

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
      // Check if today is a holiday
      const holidayChecker = new HolidayChecker();
      const today = dayjs().format("YYYY-MM-DD");

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
      // Check if today is a holiday
      const holidayChecker = new HolidayChecker();
      const today = dayjs().format("YYYY-MM-DD");

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
      const today = dayjs().format("YYYY-MM-DD");
      const isHoliday = holidayChecker.isTodayHoliday();

      console.log(`📅 Today: ${today} (${dayjs().format("dddd")})`);
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
