import { observable } from 'mobx';
import { AccountManager } from '../../badgeforcejs-lib/account_manager';
import { Issuer as Account } from '../../badgeforcejs-lib/issuer';
import { BatchStatusWatcher } from '../../badgeforcejs-lib/batch_status_watcher';

const localforage = require('localforage');

export class AccountStore { 
  @observable accounts;
  @observable current; 
  @observable loadingCache = false;
  accountDeviceStore = localforage.createInstance({name: "badgeforce-accounts"});

  batchStatusWorker = new BatchStatusWatcher();

  constructor() {
    this.accounts = [];
    this.current = null;
    this.currentTransactions = [];
  }

  switchAccount(publicKey) {
    try {
      const account = this.findAccount(publicKey);
      if(account) {
        this.current = account;
      }
    } catch (error) {
      throw error; 
    }
  }

  async newAccount(issuer) {
    try {
        this.loadingCache = true;
        if(!this.findAccount(issuer.account.publicKey)) {
          const privateKeyHex = issuer.account.signer._privateKey.asHex();
          const data = issuer.account.name ? `${issuer.account.name}-${privateKeyHex}` : privateKeyHex;
          await this.accountDeviceStore.setItem(issuer.account.publicKey, data);  
          this.accounts.push(issuer);      
        }
        this.loadingCache = false;
    } catch (error) {
      throw new Error(error);
    }
  }
  
  async getCache() {
    try {
      this.loadingCache = true;
      const keys = await this.accountDeviceStore.keys();
      const accountCache = await Promise.all(keys.map(async (key, i) => {
        const priv = await this.accountDeviceStore.getItem(key);
        return AccountManager.fromRaw(priv);
      }));

      accountCache.forEach( account => {
        if(!this.findAccount(account.publicKey))
        this.accounts.push(new Account(account));
      });
      
      if(this.accounts.length > 0) {
        this.current = this.accounts[0];
        this.loadingCache = false;
        return false;
      }

      this.loadingCache = false;
      return true;
    } catch (error) {
      throw error;
    }
  }

  findAccount(publicKey) {
    return this.accounts.find(issuer => issuer.account.publicKey === publicKey);
  }
}

export const accountStore = new AccountStore();