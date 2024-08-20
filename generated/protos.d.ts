import * as $protobuf from "protobufjs";
import Long = require("long");
/** Properties of a TerrainMap. */
export interface ITerrainMap {

    /** TerrainMap height */
    height?: (number|null);

    /** TerrainMap width */
    width?: (number|null);

    /** TerrainMap terrain */
    terrain?: (ITerrainTile[]|null);
}

/** Represents a TerrainMap. */
export class TerrainMap implements ITerrainMap {

    /**
     * Constructs a new TerrainMap.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITerrainMap);

    /** TerrainMap height. */
    public height: number;

    /** TerrainMap width. */
    public width: number;

    /** TerrainMap terrain. */
    public terrain: ITerrainTile[];

    /**
     * Creates a new TerrainMap instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TerrainMap instance
     */
    public static create(properties?: ITerrainMap): TerrainMap;

    /**
     * Encodes the specified TerrainMap message. Does not implicitly {@link TerrainMap.verify|verify} messages.
     * @param message TerrainMap message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITerrainMap, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TerrainMap message, length delimited. Does not implicitly {@link TerrainMap.verify|verify} messages.
     * @param message TerrainMap message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITerrainMap, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TerrainMap message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TerrainMap
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): TerrainMap;

    /**
     * Decodes a TerrainMap message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TerrainMap
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): TerrainMap;

    /**
     * Verifies a TerrainMap message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a TerrainMap message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TerrainMap
     */
    public static fromObject(object: { [k: string]: any }): TerrainMap;

    /**
     * Creates a plain object from a TerrainMap message. Also converts values to other types if specified.
     * @param message TerrainMap
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: TerrainMap, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this TerrainMap to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for TerrainMap
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a TerrainTile. */
export interface ITerrainTile {

    /** TerrainTile name */
    name?: (string|null);

    /** TerrainTile age */
    age?: (number|null);

    /** TerrainTile email */
    email?: (string|null);
}

/** Represents a TerrainTile. */
export class TerrainTile implements ITerrainTile {

    /**
     * Constructs a new TerrainTile.
     * @param [properties] Properties to set
     */
    constructor(properties?: ITerrainTile);

    /** TerrainTile name. */
    public name: string;

    /** TerrainTile age. */
    public age: number;

    /** TerrainTile email. */
    public email: string;

    /**
     * Creates a new TerrainTile instance using the specified properties.
     * @param [properties] Properties to set
     * @returns TerrainTile instance
     */
    public static create(properties?: ITerrainTile): TerrainTile;

    /**
     * Encodes the specified TerrainTile message. Does not implicitly {@link TerrainTile.verify|verify} messages.
     * @param message TerrainTile message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ITerrainTile, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified TerrainTile message, length delimited. Does not implicitly {@link TerrainTile.verify|verify} messages.
     * @param message TerrainTile message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ITerrainTile, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a TerrainTile message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns TerrainTile
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): TerrainTile;

    /**
     * Decodes a TerrainTile message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns TerrainTile
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): TerrainTile;

    /**
     * Verifies a TerrainTile message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a TerrainTile message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns TerrainTile
     */
    public static fromObject(object: { [k: string]: any }): TerrainTile;

    /**
     * Creates a plain object from a TerrainTile message. Also converts values to other types if specified.
     * @param message TerrainTile
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: TerrainTile, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this TerrainTile to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for TerrainTile
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}
