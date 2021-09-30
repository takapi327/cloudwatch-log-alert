
import { CloudWatchLogs } from 'aws-sdk'

import { WebClient } from '@slack/web-api'

exports.handler = (event: any) => {

  // 抽出するログデータの最大件数
  const OUTPUT_LIMIT = 5
  // 何分前までを抽出対象期間とするか
  const TIME_FROM_MIN = 10

  /**
   * API Client for Slack
   */
  const web = new WebClient(process.env.SLACK_API_TOKEN)

  const cloudWatchLogs = new CloudWatchLogs({ apiVersion: '2014-03-28' })

  const message = JSON.parse(JSON.parse(JSON.stringify(event.Records[0].Sns.Message)))

  const stateChangeTime = new Date(message['StateChangeTime'])

  const timeTo   = stateChangeTime.setMinutes(stateChangeTime.getMinutes() + 1)
  //const unixTo   = Date.parse(new Date(timeTo).toUTCString()) / 1000
  const timeFrom = stateChangeTime.setMinutes(stateChangeTime.getMinutes() - TIME_FROM_MIN)
  //const unixFrom = Date.parse(new Date(timeFrom).toUTCString()) / 1000

  /*
  console.log('===============================')
  console.log('stateChangeTime')
  console.log(stateChangeTime)
  console.log('===============================')
  console.log('timeTo')
  console.log(timeTo)
  console.log(new Date(timeTo))
  console.log('===============================')
  console.log('unixTo')
  console.log(unixTo)
  console.log('===============================')
  console.log('timeFrom')
  console.log(timeFrom)
  console.log(new Date(timeFrom))
  console.log('===============================')
  console.log('unixFrom')
  console.log(unixFrom)
  console.log('===============================')
   */

  cloudWatchLogs.describeMetricFilters({
    metricName:      message['Trigger']['MetricName'],
    metricNamespace: message['Trigger']['Namespace']
  }, (error, res) => {
    if (error) { console.log(error) }
    else {
      //console.log('==========================')
      //console.log('metricFilters')
      //console.log(res)
      //console.log(res.metricFilters![0].metricTransformations)

      cloudWatchLogs.filterLogEvents({
        logGroupName:  res.metricFilters![0].logGroupName!,
        filterPattern: res.metricFilters![0].filterPattern!,
        startTime:     timeFrom,
        endTime:       timeTo,
        limit:         OUTPUT_LIMIT
      }, (error, res) => {
        if (error) { console.log(error) }
        else {
          console.log('==========================')
          console.log('filterLogEvents')
          console.log(JSON.parse(JSON.stringify(res.events![0].message)))
          console.log(JSON.parse(JSON.stringify(res.events![0].message)))
        }
      })
    }
  })
}
