
import { ChatPostMessageArguments } from '@slack/web-api'

export function slackMessage(
  status: string
): ChatPostMessageArguments {

  return {
    channel: process.env.SLACK_CHANNEL!,
    text:    `Cloud Watch Alert の${status}通知`,
    blocks: [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": `Cloud Watch Alert の${status}通知`,
          "emoji": true
        }
      },
    ]
  }
}