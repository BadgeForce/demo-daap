import { Transactor } from './transactor';
import { AccountManager } from './account_manager';
const {Core} = require('../protobufs-js/browser/credentials/compiled').issuer_pb;
const moment = require('moment');
const { BatchStatusWatcher,  Batch, MetaData} = require('./batch_status_watcher');
const namespacing = require('./namespacing');

export class Issuer extends AccountManager {
    transactor = new Transactor();

    constructor(...args) {
        super();
        this.account = args[0];
        this.txWatcherCB = args[1];
        this.batchStatusWatcher = new BatchStatusWatcher(this.txWatcherCB.bind(this));
        this.currentPasswordCache = null;
    }

    async issueAcademic(coreData) {
        try {
            coreData.issuer = this.account.publicKey;
            console.log(coreData);
            const response = await this.transactor.issue(coreData, this.account.signer);
            const batchForWatch = new Batch(response.link, new MetaData('ISSUE', `Issued ${coreData.name} credential to ${coreData.recipient}`, moment().toString()));
            return this.batchStatusWatcher.subscribe(batchForWatch, this.txWatcherCB);
        } catch (error) {
            console.log(error)
            throw new Error(error.message);
        }
    }

    async revoke(data) {
        try {
            const {recipient, credentialName, institutionId} = data;
            const hashStateAddress = namespacing.identifierAddress(namespacing.ACADEMIC, recipient, recipient.concat(credentialName).concat(institutionId));
            const storageHash = await this.getIPFSHash(hashStateAddress);
            const degree = await this.getDegreeCore(storageHash.hash);
            const response = await this.transactor.revoke(this.account.signer.sign(Core.encode(Core.create(degree.coreInfo)).finish()), this.account.signer);
            const batchForWatch = new Batch(response.link, new MetaData('REVOKED', `Revoked credential ${credentialName} owned by ${recipient}`, moment().toString()));
            return this.batchStatusWatcher.subscribe(batchForWatch, this.txWatcherCB);
        } catch (error) {
            throw new Error(error);
        }       
    }
}