import { Transactor } from './transactor';
import { Watcher } from './batch_status_watcher';
const { BadgeForceBase } = require('./badgeforce_base');
const moment = require('moment');
const { Batch, MetaData} = require('./batch_status_watcher');
const namespacing = require('./namespacing');
const localforage = require('localforage');
const {createHash} = require('crypto');
const {Core, StorageHash } = require('../protobufs-js/browser/credentials/compiled').issuer_pb;


export class TransactionStoreManager extends BadgeForceBase {
    dbKey = 'badgeforce-transactions';
    issuerKey = '';
    cache = {};
    
    constructor(publicKey) {
        super();
        this.issuerKey = `${publicKey}-${this.dbKey}`
        this.store = localforage.createInstance({name: this.issuerKey});
        this.updateCallback = null;
    }

    bindTxtUpdates(updateCallback) {
        this.updateCallback = updateCallback;
    }

    async loadTransactions(updateCallback) {
        try {
            const keys = await this.store.keys();
            const transactions = await Promise.all(keys.map(async key => {
                return await this.store.getItem(key);
            }));
            return transactions.map(transaction => {
                return this.newTransaction(transaction, false);
            });
        }
        catch (error) {
          console.log(error);
          throw new Error("Could not load transaction data in browser storage");
        }
    }
    
    async newTransaction(transaction, persist, callback) {
        try {
            const key = this.getTransactionDBKey(transaction.link);
            this.getWatcher(key, transaction);
            if(persist) {
                await this.persistTransaction(key, transaction);
            }

            if(this.updateCallback) {
                this.updateCallback(this.cache[key]);
            }
            return transaction;
        } catch (error) {
            console.log(error);
            throw new Error("Could not save transaction data in browser storage");
        }
    }
    
    async commitTransaction(watcher) {
        try {
            this.cache[watcher.id] = watcher;
            await this.persistTransaction(watcher.id, watcher.transaction);
            if(this.updateCallback)this.updateCallback(this.cache[watcher.id]);
        } catch (error) {
            throw error;
        }
    }
      
    async persistTransaction(id, transaction) {
        try {
            await this.store.setItem(id, transaction); 
        } catch (error) {
            console.log(error);
            throw new Error("Could not save transaction data in browser storage");
        }
    }

    getWatcher(id, transaction) {
        const done = this.commitTransaction.bind(this);
        this.cache[id] = new Watcher(id, transaction, done);
        if(transaction.status === 'PENDING') {
            this.cache[id].watch();
        }
    }

    getTransactionDBKey(id) {
        return createHash('sha512').update(id).digest('hex').toLowerCase();
    }

    txtCachesize() {
        return Object.keys(this.cache).length;
    }

    getTransactions() {
        return Object.keys(this.cache).map(key => {
            return this.cache[key];
        })
    }
}

export class IssuanceStoreManager extends TransactionStoreManager {
    namespace = '';
    issuer = '';

    constructor(publicKey) {
        super(publicKey);
        this.issuer = publicKey
        this.namespace = namespacing.partialLeafAddress(this.issuer, namespacing.ISSUANCE);
        // this.loadIssuances();
    }

    async loadIssuances() {
        try {
            const { data } = await this.queryState(this.namespace, 0);
            if(data.length === 0) {
                return []
            } 
            const issuances = data.map(issuance => this.decodeIssuance(Buffer.from(issuance.data, 'base64')))
            const results = await Promise.all(issuances.map(async issuance => await this.recreateBadge(issuance)));
            return results;
        } catch (error) {
            console.log('IssuanceStoreManager:loadIssuances', error);
            throw new Error('Could not fetch issuances');
        }
    }

    async recreateBadge(issuance) {
        try {
            const hash = issuance.storageHash;
            const storageHash = StorageHash.create({hash})
            const degree = await this.getDegreeCore(storageHash.hash);
            degree.storageHash = storageHash;
            return {
                id: issuance.storageHash,
                recipient: issuance.recipientPublicKey,
                badgeName: degree.coreInfo.name,
                degree,
                issuance
            };
        } catch (error) {
            console.log('IssuanceStoreManager:recreateBadge', error);
            throw error;
        }
    }
}
export class Issuer extends IssuanceStoreManager {
    transactor = new Transactor();

    constructor(...args) {
        super(args[0].publicKey);
        this.account = args[0];
    }

    getPublicKey() {
        return this.account.publicKey;
    }

    async issueAcademic(coreData) {
        try {
            coreData.issuer = this.account.publicKey;
            const response = await this.transactor.issue(coreData, this.account.signer);
            return await this.newTransaction(new Batch(response.link, new MetaData('ISSUE', `Issued ${coreData.name} credential to ${coreData.recipient}`, moment().toString())), true); 
        } catch (error) {
            let message
            try {
                message = JSON.parse(error.message);
            } catch (error) {
                throw new Error("Something's up, please report this error as 'unknown' ");
            }
            switch (message.code) {
                case 400:
                    throw new Error("Invalid data sent, check configs or retry later");         
                default:
                    throw new Error("Could not issue at this time, try again later");
            }
        }
    }

    transformCoreInfo(degree) {
        Object.keys(degree.coreInfo).forEach(key => {
            if(degree.coreInfo[key] === "") {
                delete degree.coreInfo[key];
            }
        });
        return Core.encode(Core.create(degree.coreInfo)).finish();
    }

    async revoke(data) {
        try {
            const {recipient, credentialName, institutionId} = data;
            const hashStateAddress = namespacing.identifierAddress(namespacing.ACADEMIC, recipient, recipient.concat(credentialName).concat(institutionId));
            const storageHash = await this.getIPFSHash(hashStateAddress);
            const degree = await this.getDegreeCore(storageHash.hash);
            const response = await this.transactor.revoke(this.transformCoreInfo(degree), this.account.signer);
            await this.newTransaction(new Batch(response.link, new MetaData('REVOKED', `Revoked credential ${credentialName} owned by ${recipient}`, moment().toString())), true);
        } catch (error) {
            console.log('REVOKE:ERROR', error)
            let message
            try {
                message = JSON.parse(error.message);
            } catch (error) {
                throw new Error("Something's up, please report this error as 'unknown' ");
            }
            console.log(message);
            switch (message.code) {
                case 400:
                    throw new Error("Invalid data sent, check configs or retry later");         
                default:
                    throw new Error("Could not issue at this time, try again later");
            }
        }      
    }
}