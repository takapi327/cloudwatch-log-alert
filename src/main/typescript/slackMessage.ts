
import { ChatPostMessageArguments } from '@slack/web-api'

export function slackMessage(
  status:           string, // CloudWatch Alarmの状態
  appName:          string, // CloudWatch Alarmが発生したアプリ名 (ECS Cluster名)
  count:            string, // CloudWatch Alarmの発生回数
  cloudWatchLogUrl: string, // CloudWatch LogsのURL
  log:              string  // CloudWatch メトリクスフィルターで取得したログ内容
): ChatPostMessageArguments {

  return {
    channel: process.env.SLACK_CHANNEL!,
    text:    `Cloud Watch Alarm の${status}通知`,
    blocks: [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": `Cloud Watch Alarm の${status}通知`,
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
          "text": `<${cloudWatchLogUrl}|CloudWatchへ>`
        }
      }
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