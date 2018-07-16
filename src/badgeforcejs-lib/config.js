const configs = require('./badgeforce-configs/testnet.json');

export class Config {
    static testnet = {
        "state": `${configs.testnet.base}${configs.testnet.routes.state}`,
        "ipfs": `${configs.testnet.base}${configs.testnet.routes.ipfs}`,
        "batches": `${configs.testnet.base}${configs.testnet.routes.batches.submit}`,
        "batchStatuses": `${configs.testnet.base}${configs.testnet.routes.batches.statuses}`,
        "development": false
    };

    static development = {
        "state": `${configs.development.routes.state}`,
        "ipfs": `${configs.development.routes.ipfs}`,
        "batches": `${configs.development.routes.batches.submit}`,
        "batchStatuses": `${configs.development.routes.batches.statuses}`,
        "development": true 
    };
}

export const ChainRestConfig = process.env.NODE_ENV === 'development' ? Config.development : Config.testnet;

if(process.env.NODE_ENV === 'development') {
    console.log("DEVELOPMENT ENV", Config.development);
}