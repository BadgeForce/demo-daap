import { observable } from 'mobx';
import { ProtoDecoder } from '../../badgeforcejs-lib/badgeforce_base';
import namespacing from '../../badgeforcejs-lib/namespacing';

export class BadgeStore extends ProtoDecoder {    
    @observable cache = []; 

    async setAccount(issuer, done) {
        this.account = issuer.account.publicKey;
        this.address = namespacing.partialLeafAddress(this.account, namespacing.ACADEMIC);
        this.cache = [];
        try {
            await this.poll(done);
        } catch (error) {
            console.log(error);
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
        if(this.isValidProto(badge)) {
            if(!this.isCached(key)) {
                const entry = {
                    key: key, 
                    badge: badge
                };
                this.cache.push(entry);
            }
        } else {
            throw new Error('Invalid protobuffer data')
        }
    }

    isCached(key) {
        return this.cache.filter(badge => badge.key === key).length > 0;
    }
    async poll(done) { 
        try {
            const res = await this.queryState(this.address);
            let { data } = res;

            await Promise.all(data.map(async i => {
                const hash = this.decodeStorageHash(Buffer.from(i.data, 'base64'));
                const degree = await this.getDegreeCore(hash.hash);
                degree.storageHash = hash;
                await this.storeBadge(degree.storageHash.hash, degree);
            }));
            if(done) done(this.cache, null);
        } catch (error) {
            console.log(error);
            if(done) done(this.cache, new Error('Could not load badges, click refresh button to try again'));
        }
    }

    async updateAccount(account) {
        try {
            await this.setAccount(account);
            await this.poll(); 
        } catch (error) {
            throw error;
        }
    }
}

export const badgeStore = new BadgeStore();