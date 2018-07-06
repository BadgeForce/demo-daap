


import * as namespacing from './namespacing';
import { BadgeForceBase } from './badgeforce_base';

const {createHash} = require('crypto');
const uuidv4 = require('uuid/v4');
const protobuf = require('sawtooth-sdk/protobuf');
const {AcademicCredential, Core, Payload, PayloadAction, AnyData, Revoke } = require('../protobufs-js/browser/credentials/compiled').issuer_pb;
const google  = require('../protobufs-js/browser/credentials/compiled').google;
const config = require('./config').Config;

const FAMILY_NAME = 'badgeforce_issuer';
const FAMILY_VERSION = '1.0';
const REST_API = process.env.NODE_ENV === 'development' ? "http://localhost:3010/batches" : 'http://127.0.0.1:8008/batches';

export class Transactor extends BadgeForceBase {
    endpoint = '/batches';
    familyName = 'badgeforce_issuer';
    familyVersion = '1.0';

    batchesURI = config.testnet.batches;

    newSingleBatch = (inputs, outputs, signer, dependencies, payload) => {
        const transactionHeaderBytes = protobuf.TransactionHeader.encode({
            familyName: this.familyName,
            familyVersion: this.familyVersion,
            inputs: [...inputs],
            outputs: [...outputs],
            signerPublicKey: signer.getPublicKey().asHex(), 
            nonce: uuidv4(),
            // In this example, we're signing the batch with the same private key,
            // but the batch can be signed by another party, in which case, the
            // public key will need to be associated with that key.
            batcherPublicKey: signer.getPublicKey().asHex(),
            // In this example, there are no dependencies.  This list should include
            // an previous transaction header signatures that must be applied for
            // this transaction to successfully commit.
            // For example,
            // dependencies: ['540a6803971d1880ec73a96cb97815a95d374cbad5d865925e5aa0432fcf1931539afe10310c122c5eaae15df61236079abbf4f258889359c4d175516934484a'],
            dependencies: dependencies,
            payloadSha512: createHash('sha512').update(payload).digest('hex')
        }).finish()
    
        const transactionSignature = signer.sign(transactionHeaderBytes)
        const transaction = protobuf.Transaction.create({
            header: transactionHeaderBytes,
            headerSignature: transactionSignature,
            payload: payload
        });
    
        // create and sign batch 
        const transactions = [transaction]
        const batchHeaderBytes = protobuf.BatchHeader.encode({
            signerPublicKey: signer.getPublicKey().asHex(),
            transactionIds: transactions.map((txn) => txn.headerSignature),
        }).finish()
        const batchSignature = signer.sign(batchHeaderBytes)
        const batch = protobuf.Batch.create({
            header: batchHeaderBytes,
            headerSignature: batchSignature,
            transactions: transactions
        })
    
        // encode our batch
        return protobuf.BatchList.encode({
            batches: [batch]
        }).finish()
    }

    submitBatch = async (batch) => {
        console.log(Buffer.from(batch).toString("base64"));
        try {
            const request = new Request(this.batchesURI, {
                method: 'POST', 
                body: Buffer.from(batch).toString("base64"),
                headers: new Headers({'Content-Type': 'text/plain'})
            });
            const response = await window.fetch(request);
            return await response.json();
        } catch (error) {
            throw new Error(error)
        }
    }

    issue = async (coreData, signer) => {    
        try {
            const core = Core.create(coreData);
            const academicCred = AcademicCredential.create({coreInfo: core, signature: signer.sign(Core.encode(core).finish())});
            console.log("SIGNATURE ISSUE: ", academicCred.signature)
            // we are going to wrap this data in google.protobuf.any, to allow for arbitrary data passing in our 1 transaction handler many subhandler scheme 
            const issueAny = google.protobuf.Any.create({
                type_url: 'github.com/BadgeForce/badgeforce-chain-node/credentials/proto/issuer_pb.AcademicCredential', value: AcademicCredential.encode(academicCred).finish()
            })
    
            const payload = this.getPayload(issueAny, PayloadAction.ISSUE);
            const issuer = signer.getPublicKey().asHex();
            const namespaceAddresses = [
                namespacing.identifierAddress(namespacing.ISSUANCE, issuer, academicCred.signature.concat(issuer)),
                namespacing.identifierAddress(namespacing.ACADEMIC, core.recipient, core.recipient.concat(core.name).concat(core.institutionId))
            ];
    
            console.log('namespaceAddresses', namespaceAddresses)
    
            const inputs = [...namespaceAddresses], outputs = [...namespaceAddresses];
            return await this.submitBatch(this.newSingleBatch(inputs, outputs, signer, [], payload));
        } catch (error) {
            throw new Error(error);
        }
    }

    revoke = async (signature, signer) => {    
        try {
            const revokation = Revoke.create({signature});
            console.log("SIGNATURE REVOKE: ", revokation)
    
            // we are going to wrap this data in google.protobuf.any, to allow for arbitrary data passing in our 1 transaction handler many subhandler scheme 
            const revokationAny = google.protobuf.Any.create({
                type_url: 'github.com/BadgeForce/badgeforce-chain-node/credentials/proto/issuer_pb.Revoke', value: Revoke.encode(revokation).finish()
            })
    
            const payload = this.getPayload(revokationAny, PayloadAction.REVOKE);
            const issuer = signer.getPublicKey().asHex();
            const namespaceAddresses = [
                namespacing.identifierAddress(namespacing.ISSUANCE, issuer, signature.concat(issuer)),
            ];
    
            const inputs = [...namespaceAddresses], outputs = [...namespaceAddresses];
            return await this.submitBatch(this.newSingleBatch(inputs, outputs, signer, [], payload));
        } catch (error) {
            throw new Error(error);
        }
    }

    getPayload = (anyData, action) => {
        const data = AnyData.create({data: anyData})
        const payload = Payload.create({action: action, data: data});
        return Payload.encode(payload).finish();
    }
}












// 0340858bd43ef062513ac5f38aafbc2752f05eaf4676c83817c2266fe1cab2e879
