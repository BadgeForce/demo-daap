import { observable, computed } from 'mobx';
import { BadgeStore } from './BadgeStore';
import { AccountManager } from '../../badgeforcejs-lib/account_manager';

const localforage = require('localforage');

export class AccountStore { 
  @observable accounts;
  @observable current; 
  @observable badgeCache = {};
  deviceStore = localforage.createInstance({name: "badgeforce-accounts"});

  constructor() {
    this.deviceStore.keys()
    this.accounts = [];
    this.current = null;
  }

  async switchAccount(publicKey) {
    try {
      this.current = this.findAccount(publicKey);
      this.badgeCache = {};
    } catch (error) {
      throw error; 
    }
  }

  async newAccount(issuer) {
    try {
        this.current = issuer;
        if(!this.findAccount(issuer.account.publicKey)) {
          this.accounts.push(issuer);   
          await this.deviceStore.setItem(issuer.account.publicKey, issuer.account.signer._privateKey.asHex());      
        }
      return this.current;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getCache() {
    try {
      const keys = await this.deviceStore.keys();
      return Promise.all(keys.map(async (key, i) => {
        const priv = await this.deviceStore.getItem(key);
        return AccountManager.fromRaw(priv);
      }));
    } catch (error) {
      throw error;
    }
  }

  findAccount(publicKey) {
    return this.accounts.find(issuer => issuer.account.publicKey === publicKey);
  }
}

export const accountStore = new AccountStore();