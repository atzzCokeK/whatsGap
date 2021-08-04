class GASService {
    openSpreadsheet(fileId){
        const file = DriveApp.getFileById(fileId);
        
        if(!file){
            throw new Error(`ファイルが存在しない！(File ID: ${fileId})`);
        }
        
        return SpreadsheetApp.open(file);
    }

    closeSpreadsheet(){
        SpreadsheetApp.flush();
    }

    findBacklogResultMetaDatas(spreadsheet){
        const sheet = spreadsheet.getSheetByName("airtable");

        const lastRow = sheet.getLastRow();
        const scope = [2,1,lastRow -1, 6]
        const rows = sheet.getRange(...scope).getValues();

        let before, current;

        rows.forEach((row) => {
            console.log(row)
            switch (row[1]) {
            case "before":
                before = new BacklogResultMetadata(
                    row[0],
                    row[4],
                    row[5]
                );
                break;

            case "current":
                current = new BacklogResultMetadata(
                    row[0],
                    row[4],
                    row[5]
                );
                break;
            default :
                break;
            }
        })

        return new BacklogResultMetaDatas(before,current);
    }

    insertData(spreadsheet, backlogResultMetaData, backlogResultMap) {
        const sheet = spreadsheet.getSheetByName(backlogResultMetaData.quarter);
        const length = backlogResultMap.size
        const scope = [2,1, length, 6];
        const range = sheet.getRange(...scope);

        let newRows = []
        backlogResultMap.forEach((value, key) => {
            return newRows.push( [key
                , value.status
                , value.secondEstimatedCost
                , value.cost
                , `=IFERROR(ROUND(${value.cost}/${value.secondEstimatedCost},3),"なし")`
                , this.checkCondition(value.status, value.secondEstimatedCost, value.cost)
            ])
        })

        range.setValues(newRows)
    }

    checkCondition (status, secondEstimatedCost, cost){
        if (cost && secondEstimatedCost){
            return this._alertTargetCondition(status,secondEstimatedCost,cost)
        } else {
            return false
        }
    }
    
    _alertTargetCondition (status, secondEstimatedCost, cost) {
        const targetStatuses = ["10.テスト", "11.リリース完了"]
        const progressRate = 0.85
        return (cost / secondEstimatedCost) >= progressRate && targetStatuses.includes(status)
    }
}