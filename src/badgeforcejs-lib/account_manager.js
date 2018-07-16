
const cryptico = require('cryptico');
const {Secp256k1PrivateKey} = require('sawtooth-sdk/signing/secp256k1');
const {createContext, CryptoFactory} = require('sawtooth-sdk/signing');
const { BadgeForceBase } = require('./badgeforce_base');
const context = createContext('secp256k1');

class BadgeForceAccount {
    constructor(encryptedAccount, name) {
        this.downloadStr = encryptedAccount ? JSON.stringify(encryptedAccount) : null;
        this.account = encryptedAccount;
        this.signer = null;
        this.publicKey = null;
        this.name = name;
    }
}

export class AccountManager extends BadgeForceBase {
    constructor() {
        super();
        this.accountErrors = {
            accountNotFound: 'Account not imported, import or create new account',
            invalidPassword: 'Invalid password'
        }
    }
    
    importAccount(files, password, done) {
        try {
            const file = files.item(0);
            const callback = (err, account) => {
                if(err) {
                    done(err, null);
                } else {
                    try {
                        const decrypted = this.decryptAccount(password, account);
                        console.log(decrypted);
                        done(null, decrypted);
                    } catch (error) {                    
                        done(error, account);
                    }
                }
            }
            this.readFile(file, this.fileTypes.account, callback)
        }
        catch (error) {
            done(error, null);
        }
    }

    newAccount(password, name) {
        try {
            const keys = this.newAccessKeyPair(password);
            const signer = new CryptoFactory(context).newSigner(context.newRandomPrivateKey());
            const str = JSON.stringify({publicKey: signer.getPublicKey().asHex(), privateKey: signer._privateKey.asHex(), name: name});
            const account = new BadgeForceAccount({account: cryptico.encrypt(str, keys.pub, keys.priv).cipher}, name);
            account.signer = signer;
            account.publicKey = signer.getPublicKey().asHex();
            return account;
        } catch (error) {
            throw new Error(error);
        }
    }

    decryptAccount(password, account) {
        try {
            account = new BadgeForceAccount(account);
            const keys = this.newAccessKeyPair(password);
            const {status, plaintext} = cryptico.decrypt(account.account, keys.priv);
            if(status === 'failure') {
                throw new Error(this.accountErrors.invalidPassword);
            }

            const decrypted = JSON.parse(plaintext);
            account.signer = new CryptoFactory(context).newSigner(new Secp256k1PrivateKey(Buffer.from(decrypted.privateKey, 'hex')));
            account.publicKey = account.signer.getPublicKey().asHex();
            account.name = decrypted.name || null;
            return account;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    static fromRaw(data) {
        const accountData = data.split('-');
        const {name, privateKey} = accountData.length > 1 ? {name: accountData[0], privateKey: accountData[1]} : {privateKey: accountData[0]};
        const account = new BadgeForceAccount();
        account.signer = new CryptoFactory(context).newSigner(new Secp256k1PrivateKey(Buffer.from(privateKey, 'hex')));
        account.publicKey = account.signer.getPublicKey().asHex();
        account.name = name;
        return account;
    }
    
    newAccessKeyPair(password) {
        try {
            const priv = cryptico.generateRSAKey(password, 1024);
            const pub = cryptico.publicKeyString(priv);
            return {priv, pub}
        } catch (error) {
            throw new Error(error);
        }
    }
}
