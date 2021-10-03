
import { ChatPostMessageArguments } from '@slack/web-api'

export function slackMessage(
  status:             string, // CloudWatch Alarmの状態
  appName:            string, // CloudWatch Alarmが発生したアプリ名 (ECS Cluster名)
  count:              string, // CloudWatch Alarmの発生回数
  cloudWatchLogsUrl:  string, // CloudWatch LogsのURL
  cloudWatchAlarmUrl: string, // CloudWatch AlarmのURL
  message:            string, // アプリケーションログのメッセージ
  loggerName:         string, // アプリケーションログの発生箇所
  threadName:         string, // アプリケーションログの発生時のスレッド
  timestamp:          string  // アプリケーションログの発生時間
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
          "text": `<${cloudWatchLogsUrl}|CloudWatch Logsで確認する>`
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `<${cloudWatchAlarmUrl}|CloudWatch Alarmで確認する>`
        }
      },
      {
        "type": "divider"
      },
    ],
    "attachments": [
      {
        "color": `${status === 'ERROR' ? '#dc143c' : '#ffa500'}`,
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `${status}発生箇所: ${loggerName}`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `${status}発生時のスレッド: ${threadName}`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `アプリケーションログの発生時間: ${timestamp}`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": `アプリケーションログの${status}メッセージ`
            }
          },
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": '```' + `${message}` + '```'
            }
          },
        ]
      }
    ]
  }
}