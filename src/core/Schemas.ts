import {z} from 'zod';

export type GameID = string
export type ClientID = string

export type Intent = SpawnIntent | AttackIntent | BoatAttackIntent | UpdateNameIntent

export type AttackIntent = z.infer<typeof AttackIntentSchema>
export type SpawnIntent = z.infer<typeof SpawnIntentSchema>
export type BoatAttackIntent = z.infer<typeof BoatAttackIntentSchema>
export type UpdateNameIntent = z.infer<typeof UpdateNameIntentSchema>


export type Turn = z.infer<typeof TurnSchema>

export type ClientMessage = ClientIntentMessage | ClientJoinMessage | ClientLeaveMessage
export type ServerMessage = ServerSyncMessage | ServerStartGameMessage

export type ServerSyncMessage = z.infer<typeof ServerTurnMessageSchema>
export type ServerStartGameMessage = z.infer<typeof ServerStartGameMessageSchema>


export type ClientIntentMessage = z.infer<typeof ClientIntentMessageSchema>
export type ClientJoinMessage = z.infer<typeof ClientJoinMessageSchema>
export type ClientLeaveMessage = z.infer<typeof ClientLeaveMessageSchema>


export interface Lobby {
    id: string;
    startTime: number;
    numClients: number;
}

// Zod schemas
const BaseIntentSchema = z.object({
    type: z.enum(['attack', 'spawn', 'boat', 'name']),
    clientID: z.string(),
});

export const AttackIntentSchema = BaseIntentSchema.extend({
    type: z.literal('attack'),
    attackerID: z.string(),
    targetID: z.string().nullable(),
    troops: z.number(),
    targetX: z.number(),
    targetY: z.number()
});


export const SpawnIntentSchema = BaseIntentSchema.extend({
    type: z.literal('spawn'),
    name: z.string(),
    isBot: z.boolean(),
    x: z.number(),
    y: z.number(),
})

export const BoatAttackIntentSchema = BaseIntentSchema.extend({
    type: z.literal('boat'),
    attackerID: z.string(),
    targetID: z.string().nullable(),
    troops: z.number(),
    x: z.number(),
    y: z.number(),
})

export const UpdateNameIntentSchema = BaseIntentSchema.extend({
    type: z.literal('updateName'),
    name: z.string(),
})

const IntentSchema = z.union([AttackIntentSchema, SpawnIntentSchema, BoatAttackIntentSchema, UpdateNameIntentSchema]);

const TurnSchema = z.object({
    turnNumber: z.number(),
    gameID: z.string(),
    intents: z.array(IntentSchema)
})

// Server

const ServerBaseMessageSchema = z.object({
    type: z.string()
})

export const ServerTurnMessageSchema = ServerBaseMessageSchema.extend({
    type: z.literal('turn'),
    turn: TurnSchema,
})

export const ServerStartGameMessageSchema = ServerBaseMessageSchema.extend({
    type: z.literal('start'),
    // Turns the client missed if they are late to the game.
    turns: z.array(TurnSchema)
})


export const ServerMessageSchema = z.union([ServerTurnMessageSchema, ServerStartGameMessageSchema]);


// Client

const ClientBaseMessageSchema = z.object({
    type: z.string()
})

export const ClientIntentMessageSchema = ClientBaseMessageSchema.extend({
    type: z.literal('intent'),
    clientID: z.string(),
    gameID: z.string(),
    intent: IntentSchema
})

export const ClientJoinMessageSchema = ClientBaseMessageSchema.extend({
    type: z.literal('join'),
    clientID: z.string(),
    gameID: z.string(),
    // The last turn the client saw.
    lastTurn: z.number()
})

export const ClientLeaveMessageSchema = ClientBaseMessageSchema.extend({
    type: z.literal('leave'),
    clientID: z.string(),
    gameID: z.string(),
})

export const ClientMessageSchema = z.union([ClientIntentMessageSchema, ClientJoinMessageSchema, ClientLeaveMessageSchema]);