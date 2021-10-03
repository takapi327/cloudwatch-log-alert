
import { CloudWatchLogs } from 'aws-sdk'

import { WebClient } from '@slack/web-api'

import { slackMessage } from './slackMessage'

exports.handler = (event: any, context: any, callback: any) => {

  // 抽出するログデータの最大件数
  const OUTPUT_LIMIT = 5
  // 何分前までを抽出対象期間とするか
  const TIME_FROM_MIN = 10
  // 何分後までを抽出対象期間とするか
  const TIME_TO_MAX = 1
  // 何分前までのログを取得するか
  const LOG_FILTER_TIME_FROM_MIN = 20

  // Time Zone
  const TIME_ZONE_TOKYO = 'Asia/Tokyo'

  // AWS Lambdaのリージョンを取得
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION

  /** API Client for Slack */
  const web = new WebClient(process.env.SLACK_API_TOKEN)

  /** API Client for CloudWatchLogs */
  const cloudWatchLogs = new CloudWatchLogs({ apiVersion: '2014-03-28' })

  /** SNSから送られてくる情報をJSONに変換 */
  const snsMessage = JSON.parse(JSON.parse(JSON.stringify(event.Records[0].Sns.Message)))

  /**
   * CloudWatch Alarmの状態変更時間を使用してCloudWatch Event、Filter用の時間を生成する
   */
  const stateChangeTime    = new Date(snsMessage['StateChangeTime'])
  const logFilterTime      = new Date(snsMessage['StateChangeTime'])
  const logFilterEndTime   = logFilterTime.getTime()
  const logFilterStartTime = logFilterTime.setMinutes(logFilterTime.getMinutes() - LOG_FILTER_TIME_FROM_MIN)
  const endTime            = stateChangeTime.setMinutes(stateChangeTime.getMinutes() + TIME_TO_MAX)
  const startTime          = stateChangeTime.setMinutes(stateChangeTime.getMinutes() - TIME_FROM_MIN)

  /** MetricFilterの一覧を取得する */
  cloudWatchLogs.describeMetricFilters({
    metricName:      snsMessage['Trigger']['MetricName'],
    metricNamespace: snsMessage['Trigger']['Namespace']
  }, (error, describeMetricFiltersResponse) => {
    if (error) { console.log(error) }
    else {
      //console.log('==========================')
      //console.log('metricFilters')
      //console.log(res)
      //console.log(res.metricFilters![0].metricTransformations)

      const metricFilters: CloudWatchLogs.MetricFilters = describeMetricFiltersResponse.metricFilters!
      const logGroupName:  string = metricFilters[0].logGroupName!

      cloudWatchLogs.filterLogEvents({
        logGroupName:  logGroupName,
        filterPattern: metricFilters[0].filterPattern!,
        startTime:     startTime,
        endTime:       endTime,
        limit:         OUTPUT_LIMIT
      }, (error, filterLogEventsResponse) => {
        if (error) { console.log(error) }
        else {
          const events = filterLogEventsResponse.events!.slice(-1)[0]
          //console.log('==========================')
          //console.log('filterLogEvents')
          //console.log(filterLogEventsResponse)
          //console.log(JSON.parse(JSON.stringify(events.message)))

          const logStreamName: string = events.logStreamName!
          const trackingId:    string = JSON.parse(events.message!).tags[0]

          /** CloudWatch LogsへのURLを生成する */
          const cloudWatchLogsUrl = [
            `https://${region}.console.aws.amazon.com/`,
            `cloudwatch/home?region=${region}`,
            '#logsV2:log-groups/log-group/',
            `${logGroupName.replace(/\//g, '$252F')}/`,
            'log-events/',
            `${logStreamName}`,
            '$3FfilterPattern$3D',
            `${trackingId}`,
            `$26start$3D${logFilterStartTime}`,
            `$26end$3D${logFilterEndTime}`
          ].join('')

          /** CloudWatch AlarmへのURLを生成する */
          const cloudWatchAlarmUrl = [
            `https://${region}.console.aws.amazon.com/`,
            `cloudwatch/home?region=${region}`,
            '#alarmsV2:alarm/',
            `${snsMessage['AlarmName']}?`
          ].join('')

          const eventMessage = JSON.parse(events.message!)

          const status     = metricFilters[0].filterPattern!
          const count      = metricFilters[0].metricTransformations![0].metricValue
          const message    = eventMessage.message
          const loggerName = eventMessage.logger_name
          const threadName = eventMessage.thread_name
          const timestamp  = new Date(eventMessage['@timestamp']).toLocaleString('ja-JP', { timeZone: TIME_ZONE_TOKYO })
          const params     = slackMessage(status, process.env.ECS_CLUSTER_NAME!, count, cloudWatchLogsUrl, cloudWatchAlarmUrl, message, loggerName, threadName, timestamp)
          web.chat.postMessage(params).then(
            callback(null, 'Validation test succeeded')
          ).catch(console.error)
        }
      })
    }
  })
}
