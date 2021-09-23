
exports.handler = async(event: any) => {
  const message = JSON.parse(JSON.parse(JSON.stringify(event.Records[0].Sns.Message)))

  console.log("========Records====================")
  console.log(event.Records[0])
  console.log("============================")
  console.log("========SNS====================")
  console.log(event.Records[0].Sns)
  console.log("============================")
  console.log("========message====================")
  console.log(message)
  console.log("============================")
}
