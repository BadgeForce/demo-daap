import { observable } from 'mobx';
import { ProtoDecoder, RestClient } from '../../badgeforcejs-lib/badgeforce_base';
import namespacing from '../../badgeforcejs-lib/namespacing';

export class BadgeStore extends ProtoDecoder {
    @observable cache = {};
    
    async setAccount(issuer) {
        try {
            this.account = issuer.account.publicKey;
            this.address = namespacing.partialLeafAddress(this.account, namespacing.ACADEMIC);
            this.cache = {};
            await this.poll(); 
        } catch (error) {
            throw error;
        }
    }

    async storeBadges(keys) {
        try {
            keys.map(async key => {
                this.storeBadge(key, await this.getDegreeCore(key));
            });
        } catch (error) {
            throw error;
        }
    }

    storeBadge(key, badge) {
        if(!this.isValidProto(badge)) throw new Error('Invalid protobuffer data');
        try {            
            this.cache[key] = badge;
        } catch (error) {
            throw error;
        }
    }

    async getBadge(hash) {
        try {
            return this.cache[hash];
        } catch (error) {
            throw error;
        }
    }

    async poll() { 
        try {
            const res = await this.queryState(this.address);
            let { data } = res;
            console.log(this.address, data);
            data.map(async i => {
                const hash = this.decodeStorageHash(Buffer.from(i.data, 'base64'));
                const degree = await this.getDegreeCore(hash.hash);
                degree.storageHash = hash;
                await this.storeBadge(degree.storageHash.hash, degree);
            });
        } catch (error) {
            throw error;
        }
    }

    async updateAccount(account) {
        try {
            await this.setAccount(account);
            this.cache = {};
            await this.poll(); 
        } catch (error) {
            throw error;
        }
    }
}
