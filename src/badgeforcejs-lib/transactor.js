


import * as namespacing from './namespacing';
import { BadgeForceBase } from './badgeforce_base';
import { BadgeForceSignature } from './signature';

const {createHash} = require('crypto');
const uuidv4 = require('uuid/v4');
const protobuf = require('sawtooth-sdk/protobuf');
const {AcademicCredential, Core, Payload, PayloadAction, AnyData, Revoke } = require('../protobufs-js/browser/credentials/compiled').issuer_pb;
const google  = require('../protobufs-js/browser/credentials/compiled').google;
const config = require('./config').ChainRestConfig;

const FAMILY_NAME = 'badgeforce_issuer';
const FAMILY_VERSION = '1.0';
const REST_API = process.env.NODE_ENV === 'development' ? "http://localhost:3010/batches" : 'http://127.0.0.1:8008/batches';

export class Transactor extends BadgeForceBase {
    endpoint = '/batches';
    familyName = 'badgeforce_issuer';
    familyVersion = '1.0';

    batchesURI = config.batches;

    signatureContext = BadgeForceSignature.createContext('secp256k1');

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
        try {
            const opts = {times: 3};
            const request = this.getRequest(batch); 
            const method = async (callback) => {
                try {
                    const response = await this.parseResponseJSON(await window.fetch(request));
                    if(!response.ok) {
                        console.log(response);
                        throw JSON.stringify(response.json);
                    } else {
                        callback(null, response.json);
                    }
                } catch (error) {
                    callback(error)
                }
            }
            return  await this.retry(opts, method);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    getRequest(batch) {
        const headers = new Headers({'Content-Type': config.development ? 'application/octet-stream' : 'text/plain', 'resource':'batches'});
        const body = config.development ? batch : Buffer.from(batch).toString("base64");
        return new Request(this.batchesURI, {method: 'POST', body, headers});
    }

    async parseResponseJSON(response) {
        return new Promise((resolve) => response.json()
          .then((json) => resolve({
            status: response.status,
            ok: response.ok,
            json,
          })));
    }

    test(coreData, signer) {
        const core = Core.create(coreData);
        console.log(core)
        const signature = this.signatureContext.sign(Core.encode(core).finish(), Buffer.from(signer._privateKey.asHex(), 'hex'));
        console.log(signature.signature);
        const d = BadgeForceSignature.decode(signature.toString());
        console.log(d.signature);
        const verified = signature.verify(Core.encode(core).finish(), core.issuer);
        const verified1 = d.verify(Core.encode(core).finish(), core.issuer);
        console.log(verified);
        console.log(verified1);
    }

    issue = async (coreData, signer) => {    
        try {
            const core = Core.create(coreData);
            console.log(core)
            const signature = this.signatureContext.sign(Core.encode(core).finish(), Buffer.from(signer._privateKey.asHex(), 'hex'));
            const academicCred = AcademicCredential.create({
                coreInfo: core, 
                signature: signature.toString()
            });
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

            const inputs = [...namespaceAddresses], outputs = [...namespaceAddresses];
            return await this.submitBatch(this.newSingleBatch(inputs, outputs, signer, [], payload));
        } catch (error) {
            throw new Error(error);
        }
    }

    revoke = async (signatureBytes, signer) => {    
        try {
            const signature = this.signatureContext.sign(signatureBytes, Buffer.from(signer._privateKey.asHex(), 'hex')).toString();
            const revokation = Revoke.create({signature});    
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
