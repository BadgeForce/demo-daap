const retry = require('async/retry');
const {createHash} = require('crypto');
const secp256k1 = require('secp256k1');
const {AcademicCredential, Core, StorageHash, Issuance} = require('../protobufs-js/browser/credentials/compiled').issuer_pb;
const config = require('./config').ChainRestConfig;
const cbor = require('cbor');

export class Results {
    constructor(statusCB) {
        this.default = {message: 'Pending', success: false}
        this.checks = {0: 'Proof of Itegrity', 1: 'Recipient', 2: 'Issuer', 3: 'Signature Match', 4: 'Expiration', 5: 'Revokation', 6: 'Signature is Valid'}
        this.results = {}
        this.verified = true;
        Object.values(this.checks).forEach(val => {
            this.results[val] = this.default;
        });

        this.statusCB = statusCB;
    }

    async update(index, data) {
        if(!data.success)
            this.verified = false;
        this.results[this.checks[index]] = data;
        await this.statusCB(data);
    }
}

export class RestClient {
    stateURI = config.state;
    ipfsURI = config.ipfs;
    async queryIPFS(hash) {
        try {
            const uri = `${this.ipfsURI}/${hash}`;
            const opts = {times: 2};
            const method = async (callback) => {
                try {
                    const response = await window.fetch(new Request(uri, {method: 'GET', headers: {'Content-Type': 'application/json'}}));
                    response.status > 300 ? callback(new Error(response.statusText)): callback(null, response) ;
                } catch (error) {
                    callback(error)
                }
            }
            
            const response = await this.retry(opts, method);
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async queryState(address, retries) {
        try {
            const uri = `${this.stateURI}?address=${address}`;
            const opts = {times: 2};
            const method = async (callback) => {
                try {
                    const response = await window.fetch(new Request(uri, {method: 'GET', headers: {'Content-Type': 'application/json'}}));
                    response.status > 300 ? callback(new Error(response.statusText)): callback(null, response) ;
                } catch (error) {
                    callback(error)
                }
            }
            const response = await this.retry(opts, method);
            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    async queryBatchStatus(link) {
        try {
            const opts = {times: 10};
            const method = async (callback) => {
                try {
                    const response = await window.fetch(new Request(link, {method: 'GET', headers: {'Content-Type': 'application/json'}}));
                    response.status > 300 ? callback(new Error(response.statusText)): callback(null, response) ;
                } catch (error) {
                    callback(error)
                }
            }

            const response = await this.retry(opts, method);
            return (await response.json()).data[0].status
        } catch (error) {
            throw error;
        }
    }

    async retry(opts, method) {
        return new Promise((resolve, reject) => {
            retry(opts, method, (err, results) => {
                resolve(results);
                reject(err);
            });
        });
    }
}

export class ProtoDecoder extends RestClient {
    protos = {
        AcademicCredential: {name: Object.getPrototypeOf(AcademicCredential).constructor.name, verify: AcademicCredential.verify},
        Issuance: {name: Object.getPrototypeOf(Issuance).constructor.name, verify: Issuance.verify},
        StorageHash: {name: Object.getPrototypeOf(StorageHash).constructor.name, verify: StorageHash.verify}
    };
    
    isValidProto(proto) {
        const name = Object.getPrototypeOf(proto).constructor.name;
        if(!this.protos[name]) return false;

        return !this.protos[name].verify(proto);
    }
    
    decodeDegree(data) {
        return AcademicCredential.decode(new Uint8Array(data));
    }

    decodeIssuance(data) {
        return Issuance.decode(new Uint8Array(data));
    }

    decodeStorageHash(data) {
        return StorageHash.decode(new Uint8Array(data));
    }

    static encodedQRDegree(data) {
        console.log(data)
        const b = AcademicCredential.encode(AcademicCredential.create(data)).finish();
        return Buffer.from(b).toString('base64')
    }

    isValidPublicKey(key) {
        return secp256k1.publicKeyVerify(Buffer.from(key, 'hex'));
    }

    computeIntegrityHash(coreInfo) {
        return createHash('sha512').update(Core.encode(coreInfo).finish()).digest('hex').toLowerCase();
    }

    getSigningHash(coreInfo) {
        const obj = Core.toObject(coreInfo);
        const encoded = cbor.encode(obj);
        return createHash('sha256').update(encoded).digest('hex');
    }
    
    async getIPFSHash(stateAddress) {
        try {
            const { data } = await this.queryState(stateAddress);
            if(data.length === 0) {
                throw new Error('IPFS Hash not found');
            }
            return this.decodeStorageHash(Buffer.from(data[0].data, 'base64'));
        } catch (error) {
            throw error;
        }
    }

    async getIssuance(stateAddress) {
        try {
            const { data } = await this.queryState(stateAddress);
            if(data.length === 0) {
                throw new Error('Issuance not found');
            }
            return this.decodeIssuance(Buffer.from(data[0].data, 'base64'));
        } catch (error) {
            throw new Error(error);
        }
    }

    async getDegreeCore(hash) {
        try {
            const { data } = await this.queryIPFS(hash);
            if(!data) {
                throw new Error('IPFS badge data not found');
            }
            return this.decodeDegree(Buffer.from(data, 'base64'));
        } catch (error) {
            throw new Error(error);
        }
    }
}


export class Importer extends ProtoDecoder {
    fileTypes = {
        bfac: 'BFAC',  
        account: 'ACCOUNT',
        image: 'IMAGE', 
        imageExts: ['image/jpg', 'image/jpeg', 'image/png']
    };
    accountArgsErr = args => `Invalid arguments ${args[0] ? 'callback' : 'undefined'} `
        .concat('callback required');
    imageArgsErr = args => `Invalid arguments ${args[0] ? 'callback' : 'undefined'} `
        .concat('callback required');
    imageSizeErr = size => `File Size ${Math.floor(size/1024/1024)}MB exceeds limit 50MB`;
    bfacArgsErr = args => `Invalid arguments ${args[0] ? 'callback' : 'undefined'} `
        .concat('callback required');
    invalidFileTypeErr = fileType => `Invalid filetype: ${fileType}`;

    validateImage(file) {
        if(this.fileTypes.imageExts.filter(ftype => ftype !== file.type).length === 1) {
            throw new Error(this.invalidFileTypeErr(file.type));
        }
        if(Math.floor(file.size/1024/1024) > 50) {
            throw new Error(this.imageSizeErr(file.size));
        }
    }

    import(args, fileType) {
        let errorMsg = null,
            read = null;
        const reader = new FileReader();
        switch (fileType) {
            case this.fileTypes.account:
                errorMsg = this.accountArgsErr(args);
                reader.onload = this.accountJSONOnload(args[2]);
                read = (file) => reader.readAsText(file);
                break;
            case this.fileTypes.bfac:
                errorMsg = this.accountArgsErr(args);
                reader.onload = this.bfacOnload(args[2]);
                read = (file) => reader.readAsText(file);
                break;
            case this.fileTypes.image:
                errorMsg = this.accountArgsErr(args);
                reader.onloadend = this.imageOnLoad(args[2]);
                read = (file) => reader.readAsDataURL(file);
                break;
            default:
                throw new Error(this.invalidFileTypeErr(fileType));
        }
        if(!args || args.length < 3) throw new Error(errorMsg);
        if(fileType === this.fileTypes.image) this.validateImage(args[0]);
        read(args[0]);
    }

    accountJSONOnload(done) {
        return (e) => {
            let account,
                err = null;
            try {
                account = JSON.parse(e.target.result).account;
            } catch (error) {
                err = new Error('Malformed account data');
            }

            done(err, account);
        } 
    }

    bfacOnload(done) {
        return (e) => {
            const contents = e.target.result;
            let invalidFileType = null,
                degree = null;                   
            try {
                const parsed = JSON.parse(contents);
                degree = this.decodeDegree(Buffer.from(parsed.data, 'base64')).coreInfo;
            } catch (error) {
                console.log(error)
                invalidFileType = new Error(this.invalidFileTypeErr('Unknown'));
            }
            
            done(invalidFileType, degree);
        }
    }

    imageOnLoad(done) {
        return (reader) => done(reader.target.result);
    }

    readFile(file, fileType, callback) {
        this.import([file, fileType, callback], fileType);
    }
}

export class BadgeForceBase extends Importer {}
