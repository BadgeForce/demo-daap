import { Buffer } from 'buffer';
import { BadgeForceBase, Results } from './badgeforce_base';
const {createHash} = require('crypto');
const {Core} = require('../protobufs-js/browser/credentials/compiled').issuer_pb;
const moment = require('moment');
const secp256k1 = require('secp256k1')
const namespacing = require('./namespacing');
export class Verifier extends BadgeForceBase {
    
    constructor(...args) {
        super(args[1]);
        this.statusCB = args[0];
        this.errMsgs = {
            proofOfIntegrityHash: (computed, fromState) => {
                return `Proof of integrity hash computed:${computed} does not match hash from blockchain:${fromState}`
            }, 
            recipientMisMatch: (computed, fromState) => {
                return `Recipient computed:${computed} does not match recipient from blockchain:${fromState}`
            }, 
            issuerMisMatch: (computed, fromState) => {
                return `Issuer computed:${computed} does not match Issuer from blockchain:${fromState}`
            },
            signatureMisMatch: (computed, fromState) => {
                return `Signature computed:${computed} does not match Signature from blockchain:${fromState}`
            },
            invalidSignature: (signature) => {
                return `Signature ${signature} is invalid`
            },
            expired: (expiration) => {
                return `Credential is expired expiration:${expiration}`
            },
            revoked: () => {
                return `Credential is revoked`
            },
        }
    }

    async performChecks(degree, issuance) {
        const results = new Results(this.statusCB);
        const computedPOI = this.computeIntegrityHash(degree.coreInfo);
        
        computedPOI !== issuance.proofOfIntegrityHash ?
            await results.update(0, {message: this.errMsgs.proofOfIntegrityHash(computedPOI, issuance.proofOfIntegrityHash.hash), success: false}): 
            await results.update(0, {message: 'Proof of integrity hash, data not tempered with', success: true});
        
        degree.coreInfo.recipient !== issuance.recipientPublicKey ?
            await results.update(1, {message: this.errMsgs.recipientMisMatch(degree.coreInfo.recipient, issuance.recipient), success: false}):
            await results.update(1, {message: 'Recipient not tempered with', success: true});

        degree.coreInfo.issuer !== issuance.issuerPublicKey ?
            await results.update(2, {message: this.errMsgs.issuerMisMatch(degree.coreInfo.issuer, issuance.issuer), success: false}):
            await results.update(2, {message: 'Issuer not tempered with', success: true});

        degree.signature !== issuance.signature ?
            await results.update(3, {message: this.errMsgs.signatureMisMatch(degree.coreInfo.signature, issuance.signature), success: false}):
            await results.update(3, {message: 'Signature not tempered with', success: true});

        moment().isAfter(moment(degree.coreInfo.expiration)) ?
            await results.update(4, {message: this.errMsgs.expired(new Date().setSeconds(degree.coreInfo.expiration.seconds).toString()), success: false}):
            await results.update(4, {message: 'Credential not expired', success: true});

        issuance.revokationStatus ?
            await results.update(5, {message: this.errMsgs.revoked(), success: false}):
            await results.update(5, {message: 'Credential not revoked', success: true});

        !this.verifySignature(degree) ?
            await results.update(6, {message: this.errMsgs.invalidSignature(degree.signature), success: false}):
            await results.update(6, {message: 'Signature is valid', success: true});
        
        return {
            results: results.results,
            degree,
            issuance
        };
    }

    verifySignature(degree) {
        const sigBytes = Buffer.from(degree.signature, 'hex');
        const dataHash = createHash('sha256').update(Core.encode(degree.coreInfo).finish()).digest();
        return secp256k1.verify(dataHash, sigBytes, Buffer.from(degree.coreInfo.issuer, 'hex'));
    }

    async verifyAcademic(recipient, credentialName, institutionId) {
        try {
            const hashStateAddress = namespacing.identifierAddress(namespacing.ACADEMIC, recipient, recipient.concat(credentialName).concat(institutionId));
            const storageHash = await this.getIPFSHash(hashStateAddress);

            const degree = await this.getDegreeCore(storageHash.hash);
            degree.storageHash = storageHash;
            const issuanceStateAddress = namespacing.identifierAddress(namespacing.ISSUANCE, degree.coreInfo.issuer, degree.signature.concat(degree.coreInfo.issuer));

            const issuance = await this.getIssuance(issuanceStateAddress);
            return await this.performChecks(degree, issuance);
        } catch (error) {
            throw new Error(error);
        }
    }
}