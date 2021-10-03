
import { ChatPostMessageArguments } from '@slack/web-api'

export function slackMessage(
  status:  string,
  appName: string,
  count:   number,
  log:     string
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
      {
        "type": "section",
        "text": {
          "type": "plain_text",
          "text": `${appName}で${count}件の${status}が発生したため通知を行いました`,
          "emoji": true
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": '<https://google.com|CloudWatchへ>'
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": '<https://google.com|Githubへ>'
        }
      },
    ],
    "attachments": [
      {
        "color": "#dc143c",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": '```' + `${JSON.parse(JSON.stringify(log))}` + '```'
            }
          }
        ]
      }
    ]
  }
}