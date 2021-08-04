class AirtableService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    findBacklogResult(backlogMetaData){
        return this._fetchWithPagination(backlogMetaData)
    }

    _fetchWithPagination(
        backlogResultMetadata,
        offset,
        backlogResults = new Map()
    ) {
        const queryString = this._createQueryString(
            backlogResultMetadata,
            offset
        );

        const url = `https://api.airtable.com/v0/${backlogResultMetadata.baseId}/%E3%83%90%E3%83%83%E3%82%AF%E3%83%AD%E3%82%B0?${queryString}`;

        const params = {
            method : "get",
            headers : {
                Authorization: `Bearer ${this.apiKey}`
            },
            muteHttpExceptions: true,
        }

        const response = UrlFetchApp.fetch(url, params);
        if (response.getResponseCode() !== 200) {
            console.error(
                `Airtableがおかしい！\nResponseCode: ${response.getResponseCode()}\n${response.getContentText()}`
            );
            throw new Error(`Airtableがおかしい！`);
        }

        const obj = JSON.parse(response.getContentText());
        const nextOffset = obj.offset
        obj.records
            .forEach((record) => {
                backlogResults.set(record.fields.アイテム名
                    , new BacklogResult(record.fields.Status, record.fields.二次見積り, record.fields.実稼働))
            })

        if(nextOffset){
            Utilities.sleep(1000);
            return this._fetchWithPagination(
                backlogResultMetadata,
                nextOffset,
                backlogResults
            );
        } else {
            return backlogResults;
        }
    }

    _createQueryString(backlogResultMetadata, offset) {
        return this._createQueryParams(backlogResultMetadata, offset)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join("&");
    }

    _createQueryParams(backlogResultMetadata, offset) {
        const array = [
            ["view", backlogResultMetadata.viewId],
            ["fields%5B%5D", "アイテム名"],
            ["fields%5B%5D", "Status"],
            ["fields%5B%5D", "二次見積り"],
            ["fields%5B%5D", "実稼働"],
            ["filterByFormula", "NOT({Status} = '')"],
            ["pageSize", "100"],
        ];

        if (offset) {
            return array.concat([["offset", offset]]);
        } else {
            return array;
        }
    }
}