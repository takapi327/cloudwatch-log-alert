# CloudWatch log alert

## 概要
CloudWatchのアラートを検知し、Slackに通知するためのLambda用アプリケーション

## セットアップ
### npm
```bash
$ npm init
$ npm install typescript
$ npm tsc --init
$ npm install --save-dev @types/node
```

### yarn
```bash
$ yarn init
$ yarn add typescript
$ yarn tsc --init
$ yarn add --dev @types/node
```

## クローン
```bash
$ git clone git@github.com:takapi327/cloudwatch-log-alert.git
$ yarn init or npm init
```