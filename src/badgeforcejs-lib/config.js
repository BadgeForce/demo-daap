const configs = require('./badgeforce-configs/testnet.json');

export class Config {
    static testnet = {
        "state": `${configs.testnet.base}${configs.testnet.routes.state}`,
        "ipfs": `${configs.testnet.base}${configs.testnet.routes.ipfs}`,
        "batches": `${configs.testnet.base}${configs.testnet.routes.batches.submit}`,
        "batchStatuses": `${configs.testnet.base}${configs.testnet.routes.batches.statuses}`
    };
}