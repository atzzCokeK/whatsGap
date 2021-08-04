const execute = () => {
    const current = new Date();
    if (!_isBusinessDate(current)){
        throw new Error("営業日外なので実行できません！")
    }
    
    const apiKey = PropertiesService.getScriptProperties().getProperty("API_KEY");
    const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
    const slackAppToken = PropertiesService.getScriptProperties().getProperty("SLACK_APP_TOKEN");
    const managementChannelId  = PropertiesService.getScriptProperties().getProperty("SLACK_CHANNEL_ID");
    
    const gasService = new GASService();
    const slackBot = new SlackBot(slackAppToken, managementChannelId)
    const airtableService = new AirtableService(apiKey);
    const spreadSheet = gasService.openSpreadsheet(spreadsheetId);

    const metaDatas = gasService.findBacklogResultMetaDatas(spreadSheet)

    metaDatas.all().forEach((metadata) => {
        const backlogResultMap = airtableService.findBacklogResult(metadata);

        gasService.insertData(
            spreadSheet, metadata, backlogResultMap
        )

        let itemNames = [];
        backlogResultMap.forEach((value, key) => {
            if (gasService.checkCondition(value.status, value.secondEstimatedCost, value.cost)) {
                itemNames.push(key)
            }
        })

        try {
            console.log(metadata.quarter, itemNames)
            slackBot.postToChannel(metadata.quarter, itemNames)
        } catch (e) {
            slackBot.postErrorToChannel(e)
        }
    })

    gasService.closeSpreadsheet();
}

const _isBusinessDate = (currentDate) => {
    // 0 = 日曜日, 6 = 土曜日
    const weekendsNum = [0,6]
    const japaneseHolidayEvents = new Promise(() => {
        CalendarApp.getCalendarById('ja.japanese#holiday@group.v.calendar.google.com')})
        .then((cal) => {cal.getEventsForDay(currentDate)
        })
    return !(japaneseHolidayEvents.length > 0 || weekendsNum.includes(currentDate.getDay()));
}