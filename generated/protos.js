/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const TerrainMap = $root.TerrainMap = (() => {

    /**
     * Properties of a TerrainMap.
     * @exports ITerrainMap
     * @interface ITerrainMap
     * @property {number|null} [height] TerrainMap height
     * @property {number|null} [width] TerrainMap width
     * @property {Array.<ITerrainTile>|null} [terrain] TerrainMap terrain
     */

    /**
     * Constructs a new TerrainMap.
     * @exports TerrainMap
     * @classdesc Represents a TerrainMap.
     * @implements ITerrainMap
     * @constructor
     * @param {ITerrainMap=} [properties] Properties to set
     */
    function TerrainMap(properties) {
        this.terrain = [];
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * TerrainMap height.
     * @member {number} height
     * @memberof TerrainMap
     * @instance
     */
    TerrainMap.prototype.height = 0;

    /**
     * TerrainMap width.
     * @member {number} width
     * @memberof TerrainMap
     * @instance
     */
    TerrainMap.prototype.width = 0;

    /**
     * TerrainMap terrain.
     * @member {Array.<ITerrainTile>} terrain
     * @memberof TerrainMap
     * @instance
     */
    TerrainMap.prototype.terrain = $util.emptyArray;

    /**
     * Creates a new TerrainMap instance using the specified properties.
     * @function create
     * @memberof TerrainMap
     * @static
     * @param {ITerrainMap=} [properties] Properties to set
     * @returns {TerrainMap} TerrainMap instance
     */
    TerrainMap.create = function create(properties) {
        return new TerrainMap(properties);
    };

    /**
     * Encodes the specified TerrainMap message. Does not implicitly {@link TerrainMap.verify|verify} messages.
     * @function encode
     * @memberof TerrainMap
     * @static
     * @param {ITerrainMap} message TerrainMap message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TerrainMap.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.height != null && Object.hasOwnProperty.call(message, "height"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.height);
        if (message.width != null && Object.hasOwnProperty.call(message, "width"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.width);
        if (message.terrain != null && message.terrain.length)
            for (let i = 0; i < message.terrain.length; ++i)
                $root.TerrainTile.encode(message.terrain[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified TerrainMap message, length delimited. Does not implicitly {@link TerrainMap.verify|verify} messages.
     * @function encodeDelimited
     * @memberof TerrainMap
     * @static
     * @param {ITerrainMap} message TerrainMap message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TerrainMap.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a TerrainMap message from the specified reader or buffer.
     * @function decode
     * @memberof TerrainMap
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {TerrainMap} TerrainMap
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TerrainMap.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.TerrainMap();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.height = reader.int32();
                    break;
                }
                case 2: {
                    message.width = reader.int32();
                    break;
                }
                case 3: {
                    if (!(message.terrain && message.terrain.length))
                        message.terrain = [];
                    message.terrain.push($root.TerrainTile.decode(reader, reader.uint32()));
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };

    /**
     * Decodes a TerrainMap message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof TerrainMap
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {TerrainMap} TerrainMap
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TerrainMap.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a TerrainMap message.
     * @function verify
     * @memberof TerrainMap
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    TerrainMap.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.height != null && message.hasOwnProperty("height"))
            if (!$util.isInteger(message.height))
                return "height: integer expected";
        if (message.width != null && message.hasOwnProperty("width"))
            if (!$util.isInteger(message.width))
                return "width: integer expected";
        if (message.terrain != null && message.hasOwnProperty("terrain")) {
            if (!Array.isArray(message.terrain))
                return "terrain: array expected";
            for (let i = 0; i < message.terrain.length; ++i) {
                let error = $root.TerrainTile.verify(message.terrain[i]);
                if (error)
                    return "terrain." + error;
            }
        }
        return null;
    };

    /**
     * Creates a TerrainMap message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof TerrainMap
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {TerrainMap} TerrainMap
     */
    TerrainMap.fromObject = function fromObject(object) {
        if (object instanceof $root.TerrainMap)
            return object;
        let message = new $root.TerrainMap();
        if (object.height != null)
            message.height = object.height | 0;
        if (object.width != null)
            message.width = object.width | 0;
        if (object.terrain) {
            if (!Array.isArray(object.terrain))
                throw TypeError(".TerrainMap.terrain: array expected");
            message.terrain = [];
            for (let i = 0; i < object.terrain.length; ++i) {
                if (typeof object.terrain[i] !== "object")
                    throw TypeError(".TerrainMap.terrain: object expected");
                message.terrain[i] = $root.TerrainTile.fromObject(object.terrain[i]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a TerrainMap message. Also converts values to other types if specified.
     * @function toObject
     * @memberof TerrainMap
     * @static
     * @param {TerrainMap} message TerrainMap
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    TerrainMap.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.arrays || options.defaults)
            object.terrain = [];
        if (options.defaults) {
            object.height = 0;
            object.width = 0;
        }
        if (message.height != null && message.hasOwnProperty("height"))
            object.height = message.height;
        if (message.width != null && message.hasOwnProperty("width"))
            object.width = message.width;
        if (message.terrain && message.terrain.length) {
            object.terrain = [];
            for (let j = 0; j < message.terrain.length; ++j)
                object.terrain[j] = $root.TerrainTile.toObject(message.terrain[j], options);
        }
        return object;
    };

    /**
     * Converts this TerrainMap to JSON.
     * @function toJSON
     * @memberof TerrainMap
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    TerrainMap.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for TerrainMap
     * @function getTypeUrl
     * @memberof TerrainMap
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    TerrainMap.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/TerrainMap";
    };

    return TerrainMap;
})();

export const TerrainTile = $root.TerrainTile = (() => {

    /**
     * Properties of a TerrainTile.
     * @exports ITerrainTile
     * @interface ITerrainTile
     * @property {string|null} [name] TerrainTile name
     * @property {number|null} [age] TerrainTile age
     * @property {string|null} [email] TerrainTile email
     */

    /**
     * Constructs a new TerrainTile.
     * @exports TerrainTile
     * @classdesc Represents a TerrainTile.
     * @implements ITerrainTile
     * @constructor
     * @param {ITerrainTile=} [properties] Properties to set
     */
    function TerrainTile(properties) {
        if (properties)
            for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * TerrainTile name.
     * @member {string} name
     * @memberof TerrainTile
     * @instance
     */
    TerrainTile.prototype.name = "";

    /**
     * TerrainTile age.
     * @member {number} age
     * @memberof TerrainTile
     * @instance
     */
    TerrainTile.prototype.age = 0;

    /**
     * TerrainTile email.
     * @member {string} email
     * @memberof TerrainTile
     * @instance
     */
    TerrainTile.prototype.email = "";

    /**
     * Creates a new TerrainTile instance using the specified properties.
     * @function create
     * @memberof TerrainTile
     * @static
     * @param {ITerrainTile=} [properties] Properties to set
     * @returns {TerrainTile} TerrainTile instance
     */
    TerrainTile.create = function create(properties) {
        return new TerrainTile(properties);
    };

    /**
     * Encodes the specified TerrainTile message. Does not implicitly {@link TerrainTile.verify|verify} messages.
     * @function encode
     * @memberof TerrainTile
     * @static
     * @param {ITerrainTile} message TerrainTile message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TerrainTile.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.name != null && Object.hasOwnProperty.call(message, "name"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.name);
        if (message.age != null && Object.hasOwnProperty.call(message, "age"))
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.age);
        if (message.email != null && Object.hasOwnProperty.call(message, "email"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.email);
        return writer;
    };

    /**
     * Encodes the specified TerrainTile message, length delimited. Does not implicitly {@link TerrainTile.verify|verify} messages.
     * @function encodeDelimited
     * @memberof TerrainTile
     * @static
     * @param {ITerrainTile} message TerrainTile message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    TerrainTile.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a TerrainTile message from the specified reader or buffer.
     * @function decode
     * @memberof TerrainTile
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {TerrainTile} TerrainTile
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TerrainTile.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        let end = length === undefined ? reader.len : reader.pos + length, message = new $root.TerrainTile();
        while (reader.pos < end) {
            let tag = reader.uint32();
            switch (tag >>> 3) {
                case 1: {
                    message.name = reader.string();
                    break;
                }
                case 2: {
                    message.age = reader.int32();
                    break;
                }
                case 3: {
                    message.email = reader.string();
                    break;
                }
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    };

    /**
     * Decodes a TerrainTile message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof TerrainTile
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {TerrainTile} TerrainTile
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    TerrainTile.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a TerrainTile message.
     * @function verify
     * @memberof TerrainTile
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    TerrainTile.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.name != null && message.hasOwnProperty("name"))
            if (!$util.isString(message.name))
                return "name: string expected";
        if (message.age != null && message.hasOwnProperty("age"))
            if (!$util.isInteger(message.age))
                return "age: integer expected";
        if (message.email != null && message.hasOwnProperty("email"))
            if (!$util.isString(message.email))
                return "email: string expected";
        return null;
    };

    /**
     * Creates a TerrainTile message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof TerrainTile
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {TerrainTile} TerrainTile
     */
    TerrainTile.fromObject = function fromObject(object) {
        if (object instanceof $root.TerrainTile)
            return object;
        let message = new $root.TerrainTile();
        if (object.name != null)
            message.name = String(object.name);
        if (object.age != null)
            message.age = object.age | 0;
        if (object.email != null)
            message.email = String(object.email);
        return message;
    };

    /**
     * Creates a plain object from a TerrainTile message. Also converts values to other types if specified.
     * @function toObject
     * @memberof TerrainTile
     * @static
     * @param {TerrainTile} message TerrainTile
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    TerrainTile.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        let object = {};
        if (options.defaults) {
            object.name = "";
            object.age = 0;
            object.email = "";
        }
        if (message.name != null && message.hasOwnProperty("name"))
            object.name = message.name;
        if (message.age != null && message.hasOwnProperty("age"))
            object.age = message.age;
        if (message.email != null && message.hasOwnProperty("email"))
            object.email = message.email;
        return object;
    };

    /**
     * Converts this TerrainTile to JSON.
     * @function toJSON
     * @memberof TerrainTile
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    TerrainTile.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for TerrainTile
     * @function getTypeUrl
     * @memberof TerrainTile
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    TerrainTile.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/TerrainTile";
    };

    return TerrainTile;
})();

export {$root as default};
