import { observable } from 'mobx';
import { AccountManager } from '../../badgeforcejs-lib/account_manager';
import { Issuer as Account } from '../../badgeforcejs-lib/issuer';
import { BatchStatusWatcher } from '../../badgeforcejs-lib/batch_status_watcher';

const localforage = require('localforage');

export class AccountStore { 
  @observable accounts;
  @observable current; 
  @observable disableMenu = false;
  accountDeviceStore = localforage.createInstance({name: "badgeforce-accounts"});

  batchStatusWorker = new BatchStatusWatcher();

  constructor() {
    this.accounts = [];
    this.current = null;
    this.currentTransactions = [];
  }

  switchAccount(publicKey) {
    try {
      this.disableMenu = true;
      const account = this.findAccount(publicKey);
      if(account) {
        this.current = account;
      }
      this.disableMenu = false;
    } catch (error) {
      throw error; 
    }
  }

  async newAccount(issuer) {
    try {
        this.disableMenu = true;
        if(!this.findAccount(issuer.account.publicKey)) {
          await this.accountDeviceStore.setItem(issuer.account.publicKey, issuer.account.signer._privateKey.asHex());  
          this.accounts.push(issuer);      
        }
        this.disableMenu = false;
    } catch (error) {
      throw new Error(error);
    }
  }
  
  async getCache() {
    try {
      this.disableMenu = true;
      const keys = await this.accountDeviceStore.keys();
      const accountCache = await Promise.all(keys.map(async (key, i) => {
        const priv = await this.accountDeviceStore.getItem(key);
        return AccountManager.fromRaw(priv);
      }));

      accountCache.forEach( account => {
        this.accounts.push(new Account(account));
      });
      
      if(this.accounts.length > 0) {
        this.disableMenu = false;
        this.current = this.accounts[0];
        return false;
      }
      this.disableMenu = false;
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