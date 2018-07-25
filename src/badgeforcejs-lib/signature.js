
const secp256k1 = require('secp256k1');
const {createHash} = require('crypto');

/*  badgeforce signatures are made up of 3 parts 
    - hashing algorithm used 
    - encoding scheme of original data used 
    - signing algorithm used 

    Defaults are sha256, base64, and ECDSA 

    S = Hex(PKS(E(M))) where PKS = signing alorgithm, E is the encoding and M is the raw bytes of the message, entire signature is Hex encoded string

    Result looks like this sha256|base64|signingScheme|signature 

    With the raw data in hand you can take the hashing algorithm from the first 40 bytes is the hashing alogorithm, second 40 bytes denotes the encoding scheme
    third 40 bytes denotes the signing algorithm and 
    the rest is the actual signature 

    For now the supported hashing and signing algorithms are denoted by a 0 byte. As more schemes are added to the protocol they will get theyre own byte representation 
*/

class Context {
    hashingSchemes = [{id: this.sha1('sha256'), name: 'sha256', hash: this.sha256}];

    signingSchemes = [{id: this.sha1('secp256k1'), name: 'secp256k1'}];

    encodingSchemes = [{id: this.sha1('base64'), name: 'base64', encode: this.base64Encode, decode: this.base64Decode}];

    errors = {
        'hashingScheme':  `Unsupported hashing scheme. Supported algorithms are (${this.hashingSchemes.map(s => s.name)})`,
        'signingScheme':  `Unsupported signing scheme. Supported algorithms are (${this.signingSchemes.map(s => s.name)})`,
        'encodingScheme':  `Unsupported encoding scheme. Supported algorithms are (${this.encodingSchemes.map(s => s.name)})`,
        'unknownHashingScheme':  `error hashing data. check hashing scheme`,
        'unknown':  `error with signature, please check signature construction`,
    }

    constructor() {
        this.hashingScheme = this.hashingSchemes[0];
        this.encodingScheme = this.encodingSchemes[0];
        this.signingScheme = this.signingSchemes[0];
    }

    base64Encode(data) {
        if(typeof payload === Buffer) {
            return btoa(data.toString());
        }

        return btoa(data);
    }

    base64Decode(data) {
        if(typeof payload === Buffer) {
            return atob(data.toString());
        }
        return atob(data);
    }

    sha256(data) {
        return createHash('sha256').update(data).digest();
    }
    
    sha1(data) {
        return createHash('sha1').update(data).digest('hex');
    }

    hash(data) {
        try {
            return this.hashingScheme.hash(data);
        } catch (error) {
            throw error;
        }
    }

    decode(data) {
        try {
            return Buffer.from(data, this.encodingScheme.name);
        } catch (error) {
            throw error;
        }
    }

    encode(data) {
        if(!Buffer.isBuffer(data)) {
            throw new Error('data to encode must be a buffer or array of bytes');
        }

        try {
            return data.toString(this.encodingScheme.name);
        } catch (error) {
            throw error;
        }
    }

    setHashingScheme(scheme) {
        this.hashingScheme = this.hashingSchemes.filter(s => s.id === scheme || s.name === scheme).shift();
        if(!this.hashingScheme) {
            this.schemeError('hashing');
        }
        return this;
    }

    setEncodingScheme(scheme) {
        this.encodingScheme = this.encodingSchemes.filter(s => s.id === scheme || s.name === scheme).shift();
        if(!this.encodingScheme) {
            this.schemeError('encoding');
        }
        return this;
    }

    setSigningScheme(scheme) {
        this.signingScheme = this.signingSchemes.filter(s => s.id === scheme || s.name === scheme).shift();
        if(!this.signingScheme) {
            this.schemeError('signing');
        }
        return this;
    }

    schemeError(scheme) {
        let error;
        switch (scheme) {
            case 'hashing':
                error = this.errors.hashingScheme;
                break;
            case 'encoding':
                error = this.errors.encodingScheme;
                break;
            case 'signing':
                error = this.errors.signingScheme;
                break;
            default:    
                error = this.errors.unknown;
                break;
        }

        throw new Error(error);
    }
}

class Secp256k1Context extends Context {
    sign(message, privateKeyBytes) {
        console.log('HASH MESSAGE', this.hash(message));
        const { signature } = secp256k1.sign(this.hash(message), privateKeyBytes)
        const encoded = this.encode(signature);
        return new Signature(encoded, this);
    }

    verify(dataHash, sigBytes, publicKeyBytes) {
        return secp256k1.verify(dataHash, sigBytes, publicKeyBytes);
    }
}

class Signature {
    constructor(signature, context) {
        this.signature = signature;

        this.hashingID = context.hashingScheme.id;
        this.encodingID = context.encodingScheme.id;
        this.signingID = context.signingScheme.id;

        this.context = context;
    }
    verify(message, publicKey) {
        console.log(message);
        let publicKeyBytes = publicKey;
        if(!Buffer.isBuffer(publicKey)) {
            publicKeyBytes = Buffer.from(publicKey, 'hex');
        }

        const decodedSig = this.context.decode(this.signature);
        const sigBytes = Buffer.from(decodedSig);
        const dataHash = this.context.hash(message);
        return this.context.verify(dataHash, sigBytes, publicKeyBytes);
    }
    toString() {
        return Buffer.from(`${this.hashingID}${this.encodingID}${this.signingID}${this.signature}`).toString('hex');
    }
}

export class BadgeForceSignature {
    static decode(bfsignature) {
        bfsignature = Buffer.from(bfsignature, 'hex').toString();
        const hashingScheme = bfsignature.substring(0, 40);
        const encodingScheme = bfsignature.substring(40, 80);
        const signingScheme = bfsignature.substring(80, 120);
        const signature = bfsignature.substring(120);
        const context = BadgeForceSignature.createContext(signingScheme)
            .setHashingScheme(hashingScheme)
            .setEncodingScheme(encodingScheme)
            .setSigningScheme(signingScheme);

        return new Signature(signature, context);
    }

    static createContext(signingScheme) {
        switch (signingScheme) {
            case createHash('sha1').update('secp256k1').digest():
                return new Secp256k1Context();
            default:    
                return new Secp256k1Context();
        }
    }
}