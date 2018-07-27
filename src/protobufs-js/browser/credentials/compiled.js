/*eslint-disable block-scoped-var, no-redeclare, no-control-regex, no-prototype-builtins*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.issuer_pb = (function() {

    /**
     * Namespace issuer_pb.
     * @exports issuer_pb
     * @namespace
     */
    var issuer_pb = {};

    issuer_pb.Payload = (function() {

        /**
         * Properties of a Payload.
         * @memberof issuer_pb
         * @interface IPayload
         * @property {issuer_pb.PayloadAction|null} [action] Payload action
         * @property {issuer_pb.IAnyData|null} [data] Payload data
         */

        /**
         * Constructs a new Payload.
         * @memberof issuer_pb
         * @classdesc Represents a Payload.
         * @implements IPayload
         * @constructor
         * @param {issuer_pb.IPayload=} [properties] Properties to set
         */
        function Payload(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Payload action.
         * @member {issuer_pb.PayloadAction} action
         * @memberof issuer_pb.Payload
         * @instance
         */
        Payload.prototype.action = 0;

        /**
         * Payload data.
         * @member {issuer_pb.IAnyData|null|undefined} data
         * @memberof issuer_pb.Payload
         * @instance
         */
        Payload.prototype.data = null;

        /**
         * Creates a new Payload instance using the specified properties.
         * @function create
         * @memberof issuer_pb.Payload
         * @static
         * @param {issuer_pb.IPayload=} [properties] Properties to set
         * @returns {issuer_pb.Payload} Payload instance
         */
        Payload.create = function create(properties) {
            return new Payload(properties);
        };

        /**
         * Encodes the specified Payload message. Does not implicitly {@link issuer_pb.Payload.verify|verify} messages.
         * @function encode
         * @memberof issuer_pb.Payload
         * @static
         * @param {issuer_pb.IPayload} message Payload message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Payload.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.action != null && message.hasOwnProperty("action"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.action);
            if (message.data != null && message.hasOwnProperty("data"))
                $root.issuer_pb.AnyData.encode(message.data, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified Payload message, length delimited. Does not implicitly {@link issuer_pb.Payload.verify|verify} messages.
         * @function encodeDelimited
         * @memberof issuer_pb.Payload
         * @static
         * @param {issuer_pb.IPayload} message Payload message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Payload.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Payload message from the specified reader or buffer.
         * @function decode
         * @memberof issuer_pb.Payload
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {issuer_pb.Payload} Payload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Payload.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.issuer_pb.Payload();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.action = reader.int32();
                    break;
                case 2:
                    message.data = $root.issuer_pb.AnyData.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Payload message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof issuer_pb.Payload
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {issuer_pb.Payload} Payload
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Payload.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Payload message.
         * @function verify
         * @memberof issuer_pb.Payload
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Payload.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.action != null && message.hasOwnProperty("action"))
                switch (message.action) {
                default:
                    return "action: enum value expected";
                case 0:
                case 1:
                    break;
                }
            if (message.data != null && message.hasOwnProperty("data")) {
                var error = $root.issuer_pb.AnyData.verify(message.data);
                if (error)
                    return "data." + error;
            }
            return null;
        };

        /**
         * Creates a Payload message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof issuer_pb.Payload
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {issuer_pb.Payload} Payload
         */
        Payload.fromObject = function fromObject(object) {
            if (object instanceof $root.issuer_pb.Payload)
                return object;
            var message = new $root.issuer_pb.Payload();
            switch (object.action) {
            case "ISSUE":
            case 0:
                message.action = 0;
                break;
            case "REVOKE":
            case 1:
                message.action = 1;
                break;
            }
            if (object.data != null) {
                if (typeof object.data !== "object")
                    throw TypeError(".issuer_pb.Payload.data: object expected");
                message.data = $root.issuer_pb.AnyData.fromObject(object.data);
            }
            return message;
        };

        /**
         * Creates a plain object from a Payload message. Also converts values to other types if specified.
         * @function toObject
         * @memberof issuer_pb.Payload
         * @static
         * @param {issuer_pb.Payload} message Payload
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Payload.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.action = options.enums === String ? "ISSUE" : 0;
                object.data = null;
            }
            if (message.action != null && message.hasOwnProperty("action"))
                object.action = options.enums === String ? $root.issuer_pb.PayloadAction[message.action] : message.action;
            if (message.data != null && message.hasOwnProperty("data"))
                object.data = $root.issuer_pb.AnyData.toObject(message.data, options);
            return object;
        };

        /**
         * Converts this Payload to JSON.
         * @function toJSON
         * @memberof issuer_pb.Payload
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Payload.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Payload;
    })();

    /**
     * PayloadAction enum.
     * @name issuer_pb.PayloadAction
     * @enum {string}
     * @property {number} ISSUE=0 ISSUE value
     * @property {number} REVOKE=1 REVOKE value
     */
    issuer_pb.PayloadAction = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "ISSUE"] = 0;
        values[valuesById[1] = "REVOKE"] = 1;
        return values;
    })();

    issuer_pb.AnyData = (function() {

        /**
         * Properties of an AnyData.
         * @memberof issuer_pb
         * @interface IAnyData
         * @property {google.protobuf.IAny|null} [data] AnyData data
         */

        /**
         * Constructs a new AnyData.
         * @memberof issuer_pb
         * @classdesc Represents an AnyData.
         * @implements IAnyData
         * @constructor
         * @param {issuer_pb.IAnyData=} [properties] Properties to set
         */
        function AnyData(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AnyData data.
         * @member {google.protobuf.IAny|null|undefined} data
         * @memberof issuer_pb.AnyData
         * @instance
         */
        AnyData.prototype.data = null;

        /**
         * Creates a new AnyData instance using the specified properties.
         * @function create
         * @memberof issuer_pb.AnyData
         * @static
         * @param {issuer_pb.IAnyData=} [properties] Properties to set
         * @returns {issuer_pb.AnyData} AnyData instance
         */
        AnyData.create = function create(properties) {
            return new AnyData(properties);
        };

        /**
         * Encodes the specified AnyData message. Does not implicitly {@link issuer_pb.AnyData.verify|verify} messages.
         * @function encode
         * @memberof issuer_pb.AnyData
         * @static
         * @param {issuer_pb.IAnyData} message AnyData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AnyData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.data != null && message.hasOwnProperty("data"))
                $root.google.protobuf.Any.encode(message.data, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified AnyData message, length delimited. Does not implicitly {@link issuer_pb.AnyData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof issuer_pb.AnyData
         * @static
         * @param {issuer_pb.IAnyData} message AnyData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AnyData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AnyData message from the specified reader or buffer.
         * @function decode
         * @memberof issuer_pb.AnyData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {issuer_pb.AnyData} AnyData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AnyData.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.issuer_pb.AnyData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.data = $root.google.protobuf.Any.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AnyData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof issuer_pb.AnyData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {issuer_pb.AnyData} AnyData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AnyData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AnyData message.
         * @function verify
         * @memberof issuer_pb.AnyData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AnyData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.data != null && message.hasOwnProperty("data")) {
                var error = $root.google.protobuf.Any.verify(message.data);
                if (error)
                    return "data." + error;
            }
            return null;
        };

        /**
         * Creates an AnyData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof issuer_pb.AnyData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {issuer_pb.AnyData} AnyData
         */
        AnyData.fromObject = function fromObject(object) {
            if (object instanceof $root.issuer_pb.AnyData)
                return object;
            var message = new $root.issuer_pb.AnyData();
            if (object.data != null) {
                if (typeof object.data !== "object")
                    throw TypeError(".issuer_pb.AnyData.data: object expected");
                message.data = $root.google.protobuf.Any.fromObject(object.data);
            }
            return message;
        };

        /**
         * Creates a plain object from an AnyData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof issuer_pb.AnyData
         * @static
         * @param {issuer_pb.AnyData} message AnyData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AnyData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.data = null;
            if (message.data != null && message.hasOwnProperty("data"))
                object.data = $root.google.protobuf.Any.toObject(message.data, options);
            return object;
        };

        /**
         * Converts this AnyData to JSON.
         * @function toJSON
         * @memberof issuer_pb.AnyData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AnyData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AnyData;
    })();

    issuer_pb.Revoke = (function() {

        /**
         * Properties of a Revoke.
         * @memberof issuer_pb
         * @interface IRevoke
         * @property {string|null} [signature] Revoke signature
         */

        /**
         * Constructs a new Revoke.
         * @memberof issuer_pb
         * @classdesc Represents a Revoke.
         * @implements IRevoke
         * @constructor
         * @param {issuer_pb.IRevoke=} [properties] Properties to set
         */
        function Revoke(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Revoke signature.
         * @member {string} signature
         * @memberof issuer_pb.Revoke
         * @instance
         */
        Revoke.prototype.signature = "";

        /**
         * Creates a new Revoke instance using the specified properties.
         * @function create
         * @memberof issuer_pb.Revoke
         * @static
         * @param {issuer_pb.IRevoke=} [properties] Properties to set
         * @returns {issuer_pb.Revoke} Revoke instance
         */
        Revoke.create = function create(properties) {
            return new Revoke(properties);
        };

        /**
         * Encodes the specified Revoke message. Does not implicitly {@link issuer_pb.Revoke.verify|verify} messages.
         * @function encode
         * @memberof issuer_pb.Revoke
         * @static
         * @param {issuer_pb.IRevoke} message Revoke message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Revoke.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.signature != null && message.hasOwnProperty("signature"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.signature);
            return writer;
        };

        /**
         * Encodes the specified Revoke message, length delimited. Does not implicitly {@link issuer_pb.Revoke.verify|verify} messages.
         * @function encodeDelimited
         * @memberof issuer_pb.Revoke
         * @static
         * @param {issuer_pb.IRevoke} message Revoke message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Revoke.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Revoke message from the specified reader or buffer.
         * @function decode
         * @memberof issuer_pb.Revoke
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {issuer_pb.Revoke} Revoke
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Revoke.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.issuer_pb.Revoke();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.signature = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Revoke message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof issuer_pb.Revoke
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {issuer_pb.Revoke} Revoke
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Revoke.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Revoke message.
         * @function verify
         * @memberof issuer_pb.Revoke
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Revoke.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.signature != null && message.hasOwnProperty("signature"))
                if (!$util.isString(message.signature))
                    return "signature: string expected";
            return null;
        };

        /**
         * Creates a Revoke message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof issuer_pb.Revoke
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {issuer_pb.Revoke} Revoke
         */
        Revoke.fromObject = function fromObject(object) {
            if (object instanceof $root.issuer_pb.Revoke)
                return object;
            var message = new $root.issuer_pb.Revoke();
            if (object.signature != null)
                message.signature = String(object.signature);
            return message;
        };

        /**
         * Creates a plain object from a Revoke message. Also converts values to other types if specified.
         * @function toObject
         * @memberof issuer_pb.Revoke
         * @static
         * @param {issuer_pb.Revoke} message Revoke
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Revoke.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.signature = "";
            if (message.signature != null && message.hasOwnProperty("signature"))
                object.signature = message.signature;
            return object;
        };

        /**
         * Converts this Revoke to JSON.
         * @function toJSON
         * @memberof issuer_pb.Revoke
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Revoke.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Revoke;
    })();

    issuer_pb.Issuance = (function() {

        /**
         * Properties of an Issuance.
         * @memberof issuer_pb
         * @interface IIssuance
         * @property {string|null} [signature] Issuance signature
         * @property {string|null} [issuerPublicKey] Issuance issuerPublicKey
         * @property {string|null} [recipientPublicKey] Issuance recipientPublicKey
         * @property {boolean|null} [revokationStatus] Issuance revokationStatus
         * @property {string|null} [proofOfIntegrityHash] Issuance proofOfIntegrityHash
         * @property {string|null} [storageHash] Issuance storageHash
         */

        /**
         * Constructs a new Issuance.
         * @memberof issuer_pb
         * @classdesc Represents an Issuance.
         * @implements IIssuance
         * @constructor
         * @param {issuer_pb.IIssuance=} [properties] Properties to set
         */
        function Issuance(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Issuance signature.
         * @member {string} signature
         * @memberof issuer_pb.Issuance
         * @instance
         */
        Issuance.prototype.signature = "";

        /**
         * Issuance issuerPublicKey.
         * @member {string} issuerPublicKey
         * @memberof issuer_pb.Issuance
         * @instance
         */
        Issuance.prototype.issuerPublicKey = "";

        /**
         * Issuance recipientPublicKey.
         * @member {string} recipientPublicKey
         * @memberof issuer_pb.Issuance
         * @instance
         */
        Issuance.prototype.recipientPublicKey = "";

        /**
         * Issuance revokationStatus.
         * @member {boolean} revokationStatus
         * @memberof issuer_pb.Issuance
         * @instance
         */
        Issuance.prototype.revokationStatus = false;

        /**
         * Issuance proofOfIntegrityHash.
         * @member {string} proofOfIntegrityHash
         * @memberof issuer_pb.Issuance
         * @instance
         */
        Issuance.prototype.proofOfIntegrityHash = "";

        /**
         * Issuance storageHash.
         * @member {string} storageHash
         * @memberof issuer_pb.Issuance
         * @instance
         */
        Issuance.prototype.storageHash = "";

        /**
         * Creates a new Issuance instance using the specified properties.
         * @function create
         * @memberof issuer_pb.Issuance
         * @static
         * @param {issuer_pb.IIssuance=} [properties] Properties to set
         * @returns {issuer_pb.Issuance} Issuance instance
         */
        Issuance.create = function create(properties) {
            return new Issuance(properties);
        };

        /**
         * Encodes the specified Issuance message. Does not implicitly {@link issuer_pb.Issuance.verify|verify} messages.
         * @function encode
         * @memberof issuer_pb.Issuance
         * @static
         * @param {issuer_pb.IIssuance} message Issuance message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Issuance.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.signature != null && message.hasOwnProperty("signature"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.signature);
            if (message.issuerPublicKey != null && message.hasOwnProperty("issuerPublicKey"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.issuerPublicKey);
            if (message.recipientPublicKey != null && message.hasOwnProperty("recipientPublicKey"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.recipientPublicKey);
            if (message.revokationStatus != null && message.hasOwnProperty("revokationStatus"))
                writer.uint32(/* id 4, wireType 0 =*/32).bool(message.revokationStatus);
            if (message.proofOfIntegrityHash != null && message.hasOwnProperty("proofOfIntegrityHash"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.proofOfIntegrityHash);
            if (message.storageHash != null && message.hasOwnProperty("storageHash"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.storageHash);
            return writer;
        };

        /**
         * Encodes the specified Issuance message, length delimited. Does not implicitly {@link issuer_pb.Issuance.verify|verify} messages.
         * @function encodeDelimited
         * @memberof issuer_pb.Issuance
         * @static
         * @param {issuer_pb.IIssuance} message Issuance message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Issuance.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an Issuance message from the specified reader or buffer.
         * @function decode
         * @memberof issuer_pb.Issuance
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {issuer_pb.Issuance} Issuance
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Issuance.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.issuer_pb.Issuance();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.signature = reader.string();
                    break;
                case 2:
                    message.issuerPublicKey = reader.string();
                    break;
                case 3:
                    message.recipientPublicKey = reader.string();
                    break;
                case 4:
                    message.revokationStatus = reader.bool();
                    break;
                case 5:
                    message.proofOfIntegrityHash = reader.string();
                    break;
                case 6:
                    message.storageHash = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an Issuance message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof issuer_pb.Issuance
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {issuer_pb.Issuance} Issuance
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Issuance.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an Issuance message.
         * @function verify
         * @memberof issuer_pb.Issuance
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Issuance.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.signature != null && message.hasOwnProperty("signature"))
                if (!$util.isString(message.signature))
                    return "signature: string expected";
            if (message.issuerPublicKey != null && message.hasOwnProperty("issuerPublicKey"))
                if (!$util.isString(message.issuerPublicKey))
                    return "issuerPublicKey: string expected";
            if (message.recipientPublicKey != null && message.hasOwnProperty("recipientPublicKey"))
                if (!$util.isString(message.recipientPublicKey))
                    return "recipientPublicKey: string expected";
            if (message.revokationStatus != null && message.hasOwnProperty("revokationStatus"))
                if (typeof message.revokationStatus !== "boolean")
                    return "revokationStatus: boolean expected";
            if (message.proofOfIntegrityHash != null && message.hasOwnProperty("proofOfIntegrityHash"))
                if (!$util.isString(message.proofOfIntegrityHash))
                    return "proofOfIntegrityHash: string expected";
            if (message.storageHash != null && message.hasOwnProperty("storageHash"))
                if (!$util.isString(message.storageHash))
                    return "storageHash: string expected";
            return null;
        };

        /**
         * Creates an Issuance message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof issuer_pb.Issuance
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {issuer_pb.Issuance} Issuance
         */
        Issuance.fromObject = function fromObject(object) {
            if (object instanceof $root.issuer_pb.Issuance)
                return object;
            var message = new $root.issuer_pb.Issuance();
            if (object.signature != null)
                message.signature = String(object.signature);
            if (object.issuerPublicKey != null)
                message.issuerPublicKey = String(object.issuerPublicKey);
            if (object.recipientPublicKey != null)
                message.recipientPublicKey = String(object.recipientPublicKey);
            if (object.revokationStatus != null)
                message.revokationStatus = Boolean(object.revokationStatus);
            if (object.proofOfIntegrityHash != null)
                message.proofOfIntegrityHash = String(object.proofOfIntegrityHash);
            if (object.storageHash != null)
                message.storageHash = String(object.storageHash);
            return message;
        };

        /**
         * Creates a plain object from an Issuance message. Also converts values to other types if specified.
         * @function toObject
         * @memberof issuer_pb.Issuance
         * @static
         * @param {issuer_pb.Issuance} message Issuance
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Issuance.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.signature = "";
                object.issuerPublicKey = "";
                object.recipientPublicKey = "";
                object.revokationStatus = false;
                object.proofOfIntegrityHash = "";
                object.storageHash = "";
            }
            if (message.signature != null && message.hasOwnProperty("signature"))
                object.signature = message.signature;
            if (message.issuerPublicKey != null && message.hasOwnProperty("issuerPublicKey"))
                object.issuerPublicKey = message.issuerPublicKey;
            if (message.recipientPublicKey != null && message.hasOwnProperty("recipientPublicKey"))
                object.recipientPublicKey = message.recipientPublicKey;
            if (message.revokationStatus != null && message.hasOwnProperty("revokationStatus"))
                object.revokationStatus = message.revokationStatus;
            if (message.proofOfIntegrityHash != null && message.hasOwnProperty("proofOfIntegrityHash"))
                object.proofOfIntegrityHash = message.proofOfIntegrityHash;
            if (message.storageHash != null && message.hasOwnProperty("storageHash"))
                object.storageHash = message.storageHash;
            return object;
        };

        /**
         * Converts this Issuance to JSON.
         * @function toJSON
         * @memberof issuer_pb.Issuance
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Issuance.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Issuance;
    })();

    issuer_pb.AcademicCredential = (function() {

        /**
         * Properties of an AcademicCredential.
         * @memberof issuer_pb
         * @interface IAcademicCredential
         * @property {issuer_pb.ICore|null} [coreInfo] AcademicCredential coreInfo
         * @property {string|null} [signature] AcademicCredential signature
         * @property {issuer_pb.IStorageHash|null} [storageHash] AcademicCredential storageHash
         */

        /**
         * Constructs a new AcademicCredential.
         * @memberof issuer_pb
         * @classdesc Represents an AcademicCredential.
         * @implements IAcademicCredential
         * @constructor
         * @param {issuer_pb.IAcademicCredential=} [properties] Properties to set
         */
        function AcademicCredential(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * AcademicCredential coreInfo.
         * @member {issuer_pb.ICore|null|undefined} coreInfo
         * @memberof issuer_pb.AcademicCredential
         * @instance
         */
        AcademicCredential.prototype.coreInfo = null;

        /**
         * AcademicCredential signature.
         * @member {string} signature
         * @memberof issuer_pb.AcademicCredential
         * @instance
         */
        AcademicCredential.prototype.signature = "";

        /**
         * AcademicCredential storageHash.
         * @member {issuer_pb.IStorageHash|null|undefined} storageHash
         * @memberof issuer_pb.AcademicCredential
         * @instance
         */
        AcademicCredential.prototype.storageHash = null;

        /**
         * Creates a new AcademicCredential instance using the specified properties.
         * @function create
         * @memberof issuer_pb.AcademicCredential
         * @static
         * @param {issuer_pb.IAcademicCredential=} [properties] Properties to set
         * @returns {issuer_pb.AcademicCredential} AcademicCredential instance
         */
        AcademicCredential.create = function create(properties) {
            return new AcademicCredential(properties);
        };

        /**
         * Encodes the specified AcademicCredential message. Does not implicitly {@link issuer_pb.AcademicCredential.verify|verify} messages.
         * @function encode
         * @memberof issuer_pb.AcademicCredential
         * @static
         * @param {issuer_pb.IAcademicCredential} message AcademicCredential message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AcademicCredential.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.coreInfo != null && message.hasOwnProperty("coreInfo"))
                $root.issuer_pb.Core.encode(message.coreInfo, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.signature != null && message.hasOwnProperty("signature"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.signature);
            if (message.storageHash != null && message.hasOwnProperty("storageHash"))
                $root.issuer_pb.StorageHash.encode(message.storageHash, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified AcademicCredential message, length delimited. Does not implicitly {@link issuer_pb.AcademicCredential.verify|verify} messages.
         * @function encodeDelimited
         * @memberof issuer_pb.AcademicCredential
         * @static
         * @param {issuer_pb.IAcademicCredential} message AcademicCredential message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        AcademicCredential.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes an AcademicCredential message from the specified reader or buffer.
         * @function decode
         * @memberof issuer_pb.AcademicCredential
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {issuer_pb.AcademicCredential} AcademicCredential
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AcademicCredential.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.issuer_pb.AcademicCredential();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.coreInfo = $root.issuer_pb.Core.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.signature = reader.string();
                    break;
                case 3:
                    message.storageHash = $root.issuer_pb.StorageHash.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes an AcademicCredential message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof issuer_pb.AcademicCredential
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {issuer_pb.AcademicCredential} AcademicCredential
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        AcademicCredential.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies an AcademicCredential message.
         * @function verify
         * @memberof issuer_pb.AcademicCredential
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        AcademicCredential.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.coreInfo != null && message.hasOwnProperty("coreInfo")) {
                var error = $root.issuer_pb.Core.verify(message.coreInfo);
                if (error)
                    return "coreInfo." + error;
            }
            if (message.signature != null && message.hasOwnProperty("signature"))
                if (!$util.isString(message.signature))
                    return "signature: string expected";
            if (message.storageHash != null && message.hasOwnProperty("storageHash")) {
                var error = $root.issuer_pb.StorageHash.verify(message.storageHash);
                if (error)
                    return "storageHash." + error;
            }
            return null;
        };

        /**
         * Creates an AcademicCredential message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof issuer_pb.AcademicCredential
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {issuer_pb.AcademicCredential} AcademicCredential
         */
        AcademicCredential.fromObject = function fromObject(object) {
            if (object instanceof $root.issuer_pb.AcademicCredential)
                return object;
            var message = new $root.issuer_pb.AcademicCredential();
            if (object.coreInfo != null) {
                if (typeof object.coreInfo !== "object")
                    throw TypeError(".issuer_pb.AcademicCredential.coreInfo: object expected");
                message.coreInfo = $root.issuer_pb.Core.fromObject(object.coreInfo);
            }
            if (object.signature != null)
                message.signature = String(object.signature);
            if (object.storageHash != null) {
                if (typeof object.storageHash !== "object")
                    throw TypeError(".issuer_pb.AcademicCredential.storageHash: object expected");
                message.storageHash = $root.issuer_pb.StorageHash.fromObject(object.storageHash);
            }
            return message;
        };

        /**
         * Creates a plain object from an AcademicCredential message. Also converts values to other types if specified.
         * @function toObject
         * @memberof issuer_pb.AcademicCredential
         * @static
         * @param {issuer_pb.AcademicCredential} message AcademicCredential
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        AcademicCredential.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.coreInfo = null;
                object.signature = "";
                object.storageHash = null;
            }
            if (message.coreInfo != null && message.hasOwnProperty("coreInfo"))
                object.coreInfo = $root.issuer_pb.Core.toObject(message.coreInfo, options);
            if (message.signature != null && message.hasOwnProperty("signature"))
                object.signature = message.signature;
            if (message.storageHash != null && message.hasOwnProperty("storageHash"))
                object.storageHash = $root.issuer_pb.StorageHash.toObject(message.storageHash, options);
            return object;
        };

        /**
         * Converts this AcademicCredential to JSON.
         * @function toJSON
         * @memberof issuer_pb.AcademicCredential
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        AcademicCredential.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return AcademicCredential;
    })();

    issuer_pb.StorageHash = (function() {

        /**
         * Properties of a StorageHash.
         * @memberof issuer_pb
         * @interface IStorageHash
         * @property {string|null} [hash] StorageHash hash
         */

        /**
         * Constructs a new StorageHash.
         * @memberof issuer_pb
         * @classdesc Represents a StorageHash.
         * @implements IStorageHash
         * @constructor
         * @param {issuer_pb.IStorageHash=} [properties] Properties to set
         */
        function StorageHash(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * StorageHash hash.
         * @member {string} hash
         * @memberof issuer_pb.StorageHash
         * @instance
         */
        StorageHash.prototype.hash = "";

        /**
         * Creates a new StorageHash instance using the specified properties.
         * @function create
         * @memberof issuer_pb.StorageHash
         * @static
         * @param {issuer_pb.IStorageHash=} [properties] Properties to set
         * @returns {issuer_pb.StorageHash} StorageHash instance
         */
        StorageHash.create = function create(properties) {
            return new StorageHash(properties);
        };

        /**
         * Encodes the specified StorageHash message. Does not implicitly {@link issuer_pb.StorageHash.verify|verify} messages.
         * @function encode
         * @memberof issuer_pb.StorageHash
         * @static
         * @param {issuer_pb.IStorageHash} message StorageHash message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StorageHash.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.hash != null && message.hasOwnProperty("hash"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.hash);
            return writer;
        };

        /**
         * Encodes the specified StorageHash message, length delimited. Does not implicitly {@link issuer_pb.StorageHash.verify|verify} messages.
         * @function encodeDelimited
         * @memberof issuer_pb.StorageHash
         * @static
         * @param {issuer_pb.IStorageHash} message StorageHash message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StorageHash.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a StorageHash message from the specified reader or buffer.
         * @function decode
         * @memberof issuer_pb.StorageHash
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {issuer_pb.StorageHash} StorageHash
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StorageHash.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.issuer_pb.StorageHash();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.hash = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a StorageHash message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof issuer_pb.StorageHash
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {issuer_pb.StorageHash} StorageHash
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StorageHash.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a StorageHash message.
         * @function verify
         * @memberof issuer_pb.StorageHash
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        StorageHash.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.hash != null && message.hasOwnProperty("hash"))
                if (!$util.isString(message.hash))
                    return "hash: string expected";
            return null;
        };

        /**
         * Creates a StorageHash message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof issuer_pb.StorageHash
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {issuer_pb.StorageHash} StorageHash
         */
        StorageHash.fromObject = function fromObject(object) {
            if (object instanceof $root.issuer_pb.StorageHash)
                return object;
            var message = new $root.issuer_pb.StorageHash();
            if (object.hash != null)
                message.hash = String(object.hash);
            return message;
        };

        /**
         * Creates a plain object from a StorageHash message. Also converts values to other types if specified.
         * @function toObject
         * @memberof issuer_pb.StorageHash
         * @static
         * @param {issuer_pb.StorageHash} message StorageHash
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        StorageHash.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.hash = "";
            if (message.hash != null && message.hasOwnProperty("hash"))
                object.hash = message.hash;
            return object;
        };

        /**
         * Converts this StorageHash to JSON.
         * @function toJSON
         * @memberof issuer_pb.StorageHash
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        StorageHash.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return StorageHash;
    })();

    issuer_pb.Core = (function() {

        /**
         * Properties of a Core.
         * @memberof issuer_pb
         * @interface ICore
         * @property {string|null} [name] Core name
         * @property {string|null} [school] Core school
         * @property {string|null} [issuer] Core issuer
         * @property {string|null} [recipient] Core recipient
         * @property {string|null} [dateEarned] Core dateEarned
         * @property {string|null} [institutionId] Core institutionId
         * @property {string|null} [expiration] Core expiration
         * @property {string|null} [image] Core image
         */

        /**
         * Constructs a new Core.
         * @memberof issuer_pb
         * @classdesc Represents a Core.
         * @implements ICore
         * @constructor
         * @param {issuer_pb.ICore=} [properties] Properties to set
         */
        function Core(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Core name.
         * @member {string} name
         * @memberof issuer_pb.Core
         * @instance
         */
        Core.prototype.name = "";

        /**
         * Core school.
         * @member {string} school
         * @memberof issuer_pb.Core
         * @instance
         */
        Core.prototype.school = "";

        /**
         * Core issuer.
         * @member {string} issuer
         * @memberof issuer_pb.Core
         * @instance
         */
        Core.prototype.issuer = "";

        /**
         * Core recipient.
         * @member {string} recipient
         * @memberof issuer_pb.Core
         * @instance
         */
        Core.prototype.recipient = "";

        /**
         * Core dateEarned.
         * @member {string} dateEarned
         * @memberof issuer_pb.Core
         * @instance
         */
        Core.prototype.dateEarned = "";

        /**
         * Core institutionId.
         * @member {string} institutionId
         * @memberof issuer_pb.Core
         * @instance
         */
        Core.prototype.institutionId = "";

        /**
         * Core expiration.
         * @member {string} expiration
         * @memberof issuer_pb.Core
         * @instance
         */
        Core.prototype.expiration = "";

        /**
         * Core image.
         * @member {string} image
         * @memberof issuer_pb.Core
         * @instance
         */
        Core.prototype.image = "";

        /**
         * Creates a new Core instance using the specified properties.
         * @function create
         * @memberof issuer_pb.Core
         * @static
         * @param {issuer_pb.ICore=} [properties] Properties to set
         * @returns {issuer_pb.Core} Core instance
         */
        Core.create = function create(properties) {
            return new Core(properties);
        };

        /**
         * Encodes the specified Core message. Does not implicitly {@link issuer_pb.Core.verify|verify} messages.
         * @function encode
         * @memberof issuer_pb.Core
         * @static
         * @param {issuer_pb.ICore} message Core message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Core.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.name != null && message.hasOwnProperty("name"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
            if (message.school != null && message.hasOwnProperty("school"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.school);
            if (message.issuer != null && message.hasOwnProperty("issuer"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.issuer);
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.recipient);
            if (message.dateEarned != null && message.hasOwnProperty("dateEarned"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.dateEarned);
            if (message.institutionId != null && message.hasOwnProperty("institutionId"))
                writer.uint32(/* id 6, wireType 2 =*/50).string(message.institutionId);
            if (message.expiration != null && message.hasOwnProperty("expiration"))
                writer.uint32(/* id 7, wireType 2 =*/58).string(message.expiration);
            if (message.image != null && message.hasOwnProperty("image"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.image);
            return writer;
        };

        /**
         * Encodes the specified Core message, length delimited. Does not implicitly {@link issuer_pb.Core.verify|verify} messages.
         * @function encodeDelimited
         * @memberof issuer_pb.Core
         * @static
         * @param {issuer_pb.ICore} message Core message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Core.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Core message from the specified reader or buffer.
         * @function decode
         * @memberof issuer_pb.Core
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {issuer_pb.Core} Core
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Core.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.issuer_pb.Core();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.name = reader.string();
                    break;
                case 2:
                    message.school = reader.string();
                    break;
                case 3:
                    message.issuer = reader.string();
                    break;
                case 4:
                    message.recipient = reader.string();
                    break;
                case 5:
                    message.dateEarned = reader.string();
                    break;
                case 6:
                    message.institutionId = reader.string();
                    break;
                case 7:
                    message.expiration = reader.string();
                    break;
                case 8:
                    message.image = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Core message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof issuer_pb.Core
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {issuer_pb.Core} Core
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Core.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Core message.
         * @function verify
         * @memberof issuer_pb.Core
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Core.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.name != null && message.hasOwnProperty("name"))
                if (!$util.isString(message.name))
                    return "name: string expected";
            if (message.school != null && message.hasOwnProperty("school"))
                if (!$util.isString(message.school))
                    return "school: string expected";
            if (message.issuer != null && message.hasOwnProperty("issuer"))
                if (!$util.isString(message.issuer))
                    return "issuer: string expected";
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                if (!$util.isString(message.recipient))
                    return "recipient: string expected";
            if (message.dateEarned != null && message.hasOwnProperty("dateEarned"))
                if (!$util.isString(message.dateEarned))
                    return "dateEarned: string expected";
            if (message.institutionId != null && message.hasOwnProperty("institutionId"))
                if (!$util.isString(message.institutionId))
                    return "institutionId: string expected";
            if (message.expiration != null && message.hasOwnProperty("expiration"))
                if (!$util.isString(message.expiration))
                    return "expiration: string expected";
            if (message.image != null && message.hasOwnProperty("image"))
                if (!$util.isString(message.image))
                    return "image: string expected";
            return null;
        };

        /**
         * Creates a Core message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof issuer_pb.Core
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {issuer_pb.Core} Core
         */
        Core.fromObject = function fromObject(object) {
            if (object instanceof $root.issuer_pb.Core)
                return object;
            var message = new $root.issuer_pb.Core();
            if (object.name != null)
                message.name = String(object.name);
            if (object.school != null)
                message.school = String(object.school);
            if (object.issuer != null)
                message.issuer = String(object.issuer);
            if (object.recipient != null)
                message.recipient = String(object.recipient);
            if (object.dateEarned != null)
                message.dateEarned = String(object.dateEarned);
            if (object.institutionId != null)
                message.institutionId = String(object.institutionId);
            if (object.expiration != null)
                message.expiration = String(object.expiration);
            if (object.image != null)
                message.image = String(object.image);
            return message;
        };

        /**
         * Creates a plain object from a Core message. Also converts values to other types if specified.
         * @function toObject
         * @memberof issuer_pb.Core
         * @static
         * @param {issuer_pb.Core} message Core
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Core.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.name = "";
                object.school = "";
                object.issuer = "";
                object.recipient = "";
                object.dateEarned = "";
                object.institutionId = "";
                object.expiration = "";
                object.image = "";
            }
            if (message.name != null && message.hasOwnProperty("name"))
                object.name = message.name;
            if (message.school != null && message.hasOwnProperty("school"))
                object.school = message.school;
            if (message.issuer != null && message.hasOwnProperty("issuer"))
                object.issuer = message.issuer;
            if (message.recipient != null && message.hasOwnProperty("recipient"))
                object.recipient = message.recipient;
            if (message.dateEarned != null && message.hasOwnProperty("dateEarned"))
                object.dateEarned = message.dateEarned;
            if (message.institutionId != null && message.hasOwnProperty("institutionId"))
                object.institutionId = message.institutionId;
            if (message.expiration != null && message.hasOwnProperty("expiration"))
                object.expiration = message.expiration;
            if (message.image != null && message.hasOwnProperty("image"))
                object.image = message.image;
            return object;
        };

        /**
         * Converts this Core to JSON.
         * @function toJSON
         * @memberof issuer_pb.Core
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Core.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Core;
    })();

    return issuer_pb;
})();

$root.google = (function() {

    /**
     * Namespace google.
     * @exports google
     * @namespace
     */
    var google = {};

    google.protobuf = (function() {

        /**
         * Namespace protobuf.
         * @memberof google
         * @namespace
         */
        var protobuf = {};

        protobuf.Any = (function() {

            /**
             * Properties of an Any.
             * @memberof google.protobuf
             * @interface IAny
             * @property {string|null} [type_url] Any type_url
             * @property {Uint8Array|null} [value] Any value
             */

            /**
             * Constructs a new Any.
             * @memberof google.protobuf
             * @classdesc Represents an Any.
             * @implements IAny
             * @constructor
             * @param {google.protobuf.IAny=} [properties] Properties to set
             */
            function Any(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Any type_url.
             * @member {string} type_url
             * @memberof google.protobuf.Any
             * @instance
             */
            Any.prototype.type_url = "";

            /**
             * Any value.
             * @member {Uint8Array} value
             * @memberof google.protobuf.Any
             * @instance
             */
            Any.prototype.value = $util.newBuffer([]);

            /**
             * Creates a new Any instance using the specified properties.
             * @function create
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny=} [properties] Properties to set
             * @returns {google.protobuf.Any} Any instance
             */
            Any.create = function create(properties) {
                return new Any(properties);
            };

            /**
             * Encodes the specified Any message. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @function encode
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny} message Any message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Any.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.type_url != null && message.hasOwnProperty("type_url"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.type_url);
                if (message.value != null && message.hasOwnProperty("value"))
                    writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.value);
                return writer;
            };

            /**
             * Encodes the specified Any message, length delimited. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @function encodeDelimited
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.IAny} message Any message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Any.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an Any message from the specified reader or buffer.
             * @function decode
             * @memberof google.protobuf.Any
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {google.protobuf.Any} Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Any.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.google.protobuf.Any();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.type_url = reader.string();
                        break;
                    case 2:
                        message.value = reader.bytes();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an Any message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof google.protobuf.Any
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {google.protobuf.Any} Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Any.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an Any message.
             * @function verify
             * @memberof google.protobuf.Any
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Any.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.type_url != null && message.hasOwnProperty("type_url"))
                    if (!$util.isString(message.type_url))
                        return "type_url: string expected";
                if (message.value != null && message.hasOwnProperty("value"))
                    if (!(message.value && typeof message.value.length === "number" || $util.isString(message.value)))
                        return "value: buffer expected";
                return null;
            };

            /**
             * Creates an Any message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof google.protobuf.Any
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {google.protobuf.Any} Any
             */
            Any.fromObject = function fromObject(object) {
                if (object instanceof $root.google.protobuf.Any)
                    return object;
                var message = new $root.google.protobuf.Any();
                if (object.type_url != null)
                    message.type_url = String(object.type_url);
                if (object.value != null)
                    if (typeof object.value === "string")
                        $util.base64.decode(object.value, message.value = $util.newBuffer($util.base64.length(object.value)), 0);
                    else if (object.value.length)
                        message.value = object.value;
                return message;
            };

            /**
             * Creates a plain object from an Any message. Also converts values to other types if specified.
             * @function toObject
             * @memberof google.protobuf.Any
             * @static
             * @param {google.protobuf.Any} message Any
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Any.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.type_url = "";
                    object.value = options.bytes === String ? "" : [];
                }
                if (message.type_url != null && message.hasOwnProperty("type_url"))
                    object.type_url = message.type_url;
                if (message.value != null && message.hasOwnProperty("value"))
                    object.value = options.bytes === String ? $util.base64.encode(message.value, 0, message.value.length) : options.bytes === Array ? Array.prototype.slice.call(message.value) : message.value;
                return object;
            };

            /**
             * Converts this Any to JSON.
             * @function toJSON
             * @memberof google.protobuf.Any
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Any.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Any;
        })();

        return protobuf;
    })();

    return google;
})();

module.exports = $root;
