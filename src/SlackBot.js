class SlackBot {
    constructor(slackAppToken, managementChannelId) {
        this.slackAppToken = slackAppToken
        this.managementChannelId  = managementChannelId
        // times_atsushi(dev用)
        // this.managementChannelId  = "CUQGQRNH3"
    }

    postToChannel (quarter, itemNames) {
        const br = "\n"
        const nameListForView = "• " + itemNames.join(br + br +"• ")
        const text = itemNames.length === 0 ? "アラートするアイテムはありません :wave:" : nameListForView
        const colorCode = itemNames.length === 0 ? "#87F332" : "#FF6E6E"
        const message_options = {
            "method": "post",
            "contentType": "application/x-www-form-urlencoded",
            "payload": {
                "token": this.slackAppToken,
                "channel": this.managementChannelId,
                "attachments": `[
                                    {
                                        "color": "${colorCode}",
                                        "blocks": [
                                            {
                                                "type": "header",
                                                "text": {
                                                    "type": "plain_text",
                                                    "text": "${quarter}"
                                                }
                                            },
                                            {
                                                "type": "section",
                                                "text": {
                                                    "type": "mrkdwn",
                                                    "text": " *消化率85%以上* かつ、ステータス「 *テスト・リリース完了* 」以外のアイテムを表示します。"
                                                }
                                            },
                                            {
                                                "type" : "divider"
                                            },
                                            {
                                                "type" : "section",
                                                "text" : {
                                                    "type" : "mrkdwn",
                                                    "text" : "${text}"
                                               }
                                           },
                                        ]
                                    }
                                ]`,
                "muteHttpExceptions": true
            }};
        const message_url = 'https://slack.com/api/chat.postMessage';

        const response = UrlFetchApp.fetch(message_url, message_options);

        if (response.getResponseCode() !== 200) {
            console.error(`${response.getResponseCode()}: ${response.getContentText()}`)
            throw new Error("SlackBot通知がおかしい！")
        }
        console.log(response.getContentText())
        return response
    }

    postErrorToChannel (error){
        const message_options = {
            "method": "post",
            "contentType": "application/x-www-form-urlencoded",
            "payload": {
                "token": this.slackAppToken,
                "channel": this.managementChannelId,
                "text": `何らかの処理が失敗しています。ログを見てみてね。\n ${error.message}`
            },
        };
        const message_url = 'https://slack.com/api/chat.postMessage';

        UrlFetchApp.fetch(message_url, message_options);
    }
}