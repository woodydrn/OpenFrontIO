import WebSocket from 'ws';
import {ClientID} from '../core/Schemas';


export class Client {
    constructor(public readonly id: ClientID, public readonly ws: WebSocket) { }
}