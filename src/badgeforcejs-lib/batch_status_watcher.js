
import { RestClient } from './badgeforce_base';

export class MetaData {
    constructor(action, description, date, meta){
        this.action = action; 
        this.description = description;
        this.date = date;
        this.meta = meta; 
    }
}


export class Batch {
    constructor(link, metaData) {
        this.link = link; 
        this.metaData = metaData;
        this.status = 'PENDING'; 
        this.data = {};
    }
}

export class Watcher extends RestClient {
    constructor(id, transaction, commited) {
        super();
        this.transaction = transaction;
        this.commited = commited;
        this.link = transaction.link;
        this.id = id;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async watch() {
        try {
            while(this.transaction.status === 'PENDING') {
                await this.sleep(5000);
                await this.poll();
            }
            this.commited(this);
        } catch (error) {
            // throw new Error(error);   
            console.log(error);
        }
    }

    async poll() {
        try {
            this.transaction.status = await this.queryBatchStatus(this.link);
        } catch (error) {
            throw new Error(error);
        }
    }
}

export class BatchStatusWatcher {
    constructor(done) {
        this.done = done;
    }

    static subscribe(batch, id, cb) {
        const watcher = new Watcher(batch, cb);
        watcher.watch();
        return watcher;
    }

    async unsubscribe(id) {
        const transaction = this.watchers[id];
        try {
            delete this.watchers[id];
            await this.done(id, transaction);
        } catch (error) {
            throw new Error(JSON.stringify({error: "Could not unsubcribe watcher", id: id, transaction}));
        }
    }
}