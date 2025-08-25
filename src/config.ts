import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const config = {
  slackToken: process.env.SLACK_TOKEN || process.env.SLACK_BOT_TOKEN,
  slackChannel: process.env.SLACK_CHANNEL,
  startDefaultMessage: process.env.START_DEFAULT_MESSAGE || "業務開始",
  endDefaultMessage: process.env.END_DEFAULT_MESSAGE || "業務終了",
};
