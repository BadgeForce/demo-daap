
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

export class Watcher {
    constructor(transaction, done) {
        this.transaction = transaction;
        this.done = done;
        this.id = transaction.link;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async watch() {
        try {
            while(this.transaction.status === 'PENDING') {
                await this.sleep(5000);
                console.log("POLLING");
                await this.poll();
            }

            this.done(this);
        } catch (error) {
            throw new Error(error);   
        }
    }
    async poll() {
        try {
            const response = await window.fetch(new Request(this.id, {method: 'GET', headers: {'Content-Type': 'application/json'}}));
            this.transaction.status = (await response.json()).data[0].status;
        } catch (error) {
            throw new Error(error);
        }
    }
}

export class BatchStatusWatcher {
    constructor(store) {
        this.store = store;
    }

    watcherCB(commitedTxn, watcherLink) {
        this.unsubscribe(watcherLink);
    }

    subscribe(batch, cb) {
        const watcher = new Watcher(batch, cb);
        watcher.watch();
        return watcher;
    }

    unsubscribe(watcherLink) {
        this.watchers = this.watchers.filter(w => {
            return w.link !== watcherLink;
        });
    }
}