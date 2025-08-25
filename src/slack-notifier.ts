import { WebClient } from "@slack/web-api";
import { config } from "./config";

export class SlackNotifier {
  private readonly client: WebClient;
  private readonly channel: string;

  constructor() {
    if (!config.slackToken) {
      throw new Error(
        "SLACK_TOKEN is required. Please set it in .env file or environment variables."
      );
    }

    if (!config.slackChannel) {
      throw new Error(
        "SLACK_CHANNEL is required. Please set it in .env file or environment variables."
      );
    }

    this.client = new WebClient(config.slackToken);
    this.channel = config.slackChannel;
  }

  async sendNotification(message: string): Promise<void> {
    try {
      const result = await this.client.chat.postMessage({
        channel: this.channel,
        text: message,
      });

      if (!result.ok) {
        throw new Error(`Slack API error: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to send Slack notification:", error);
      throw error;
    }
  }

  async checkConnection(): Promise<void> {
    try {
      // Test the connection by calling auth.test
      const authTest = await this.client.auth.test();

      if (!authTest.ok) {
        throw new Error(`Slack authentication failed: ${authTest.error}`);
      }

      console.log(`Connected to Slack as: ${authTest.user} (${authTest.team})`);

      // Test if the channel exists and is accessible
      const channelInfo = await this.client.conversations.info({
        channel: this.channel,
      });

      if (!channelInfo.ok) {
        throw new Error(
          `Cannot access channel '${this.channel}': ${channelInfo.error}`
        );
      }

      console.log(
        `Target channel: #${channelInfo.channel?.name || this.channel}`
      );
    } catch (error) {
      console.error("Slack connection check failed:", error);
      throw error;
    }
  }
}
