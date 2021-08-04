class BacklogResultMetadata {
    constructor(quarter, baseId, viewId) {
        this.quarter = quarter;
        this.baseId = baseId;
        this.viewId = viewId;
    }
}

class BacklogResultMetaDatas {
    constructor(before, current) {
        if (!current) {
            throw new Error(`今Qが指定されていないぞ！`);
        }

        this.before = before;
        this.current = current;
    }

    all() {
        return [this.before, this.current].filter((d) => d != null);
    }
}

class BacklogResult {
    constructor(status, secondEstimatedCost, cost) {
        this.status = status;
        this.secondEstimatedCost = secondEstimatedCost;
        this.cost = cost;
    }
}