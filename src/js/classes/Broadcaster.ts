
/*
╭────────────────────────────────╮
│ Broadcaster                    │
├────────────────────────────────┤
│ subscribe()                    │
│ publish()                      │
╰────────────────────────────────╯

TODO:
- Detect recursion


## Don't broadcast messages while previous message is not yet handled by all listeners

Example of broadcast tree:
A
├─B
│ ├─C
│ └─D
└─E
  └─F

Broadcasted   Queue           Info
-----------   -----           ----
A:            B, E            listeners of A wants to broadcast B, E -> Queue
B:               E, C, D      listeners of B wants to broadcast C, D -> Queue
E:                  C, D, F   listeners of E wants to broadcast F -> Queue
C:                     D, F
D:                        F
F

Result: First level one is broadcasted, then child levels are broadcasted


## Message data should not be mutated, else next listener can get other data and order is important
To improve this problem I added a way to execute code after current message is handled by all listeners.
At this way mutation could be done after all listeners have chacked message (sync)
Remark: Order could also be important there, I probably need some sort of dependency tree of handlers

*/

declare global {

	/**
	 * A function that handles messages
	 * @param message Message to handle
	 * @param executeAfterAllMessagesHandled Return function to must be executed after current message is handled by ALL listeners
	 */
	type BroadcasterListener<TMessage extends Message = Message> = (
		message: TMessage,

		// Function that return a function to execute later
		executeAfterAllMessagesHandled: (handlerToQueue: (message: TMessage) => any) => any
	) => void;

	interface IReadonlyBroadcaster<TMessage extends Message = Message> {
		subscribe(onMessage: BroadcasterListener<TMessage>): () => void;
		subscribeOnMessage<TMessageName extends MessageNames>(messageName: TMessageName, onMessage: BroadcasterListener<MessageMap[TMessageName]>): () => void;
	}

	interface IBroadcaster<TMessage extends Message = Message> extends IReadonlyBroadcaster<TMessage> {
		publish(message: TMessage): TMessage;
	}

	interface Message<TName extends string = MessageNames> {
		readonly name: TName;
	}

	// Build maps of known messages */
	type MessageMapValidator<T extends string> = {
		[P in T]: Message<P>;
	};

	/** Should be augmented with new Messages */
	interface MessageMap extends MessageMapValidator<keyof MessageMap> {}
	type MessageNames = keyof MessageMap;
	type AllowedMessages = MessageMap[MessageNames];

	type FilterMessageOnProp<TPropName extends string, TMap extends MessageMap = MessageMap> = TMap[{
		[TName in keyof TMap]: keyof TMap[TName] & TPropName & TMap[TName]; // & TPropName
	}[keyof { // X[keyof X] // trick to remove never props from Type
		[TName in keyof TMap]: keyof TMap[TName] & TPropName & TMap[TName];
	}]["name"]];

}

export function isMessage<TName extends MessageNames>(message: AllowedMessages, name: TName): message is MessageMap[TName];
export function isMessage(message: AllowedMessages, name?: string): message is AllowedMessages;
export function isMessage(message: AllowedMessages, name?: string): message is AllowedMessages {
	return message && name ? message.name === name : true;
}

export class Broadcaster implements IBroadcaster {
	private listeners: BroadcasterListener<AllowedMessages>[];
	private publishQueue: AllowedMessages[];
	private isPublishing: boolean;

	constructor() {
		this.listeners = [];
		this.publishQueue = [];
		this.isPublishing = false;
	}

	/** Get notificaions of executed (root) commands */
	public subscribe(onMessage: BroadcasterListener<AllowedMessages>): () => void {
		const copiedFunction = onMessage.bind(undefined);
		this.listeners.push(copiedFunction);

		// Return unsubscribe method
		return () => {
			const index = this.listeners.indexOf(copiedFunction);
			if (index >= 0) this.listeners.splice(index, 1);
		};
	}

	/** Get notifications of a specify message */
	public subscribeOnMessage<TMessageName extends MessageNames>(messageName: TMessageName, onMessage: BroadcasterListener<MessageMap[TMessageName]>): () => void {

		function subscribeOnMessageFilter(message: AllowedMessages, executeAfter: (handlerToQueue: (message: AllowedMessages) => void) => any) {
			if (message.name === messageName) onMessage(message, executeAfter);
		}
		this.listeners.push(subscribeOnMessageFilter);

		// Return unsubscribe method
		return () => {
			const index = this.listeners.indexOf(subscribeOnMessageFilter);
			if (index >= 0) this.listeners.splice(index, 1);
		};
	}

	/** Subscribe to a message until the done callback is called */
	/*public subscribeUntilAsync<TResult>(onMessage: (message: AllowedMessages, done: (result?: TResult, err?: any) => void) => void): Promise<TResult> {
		return new Promise((resolve, reject) => {
			const unsubscribe = this.subscribe(message => onMessage(message, end));
			function end(result?: TResult, err?: any) {
				if (unsubscribe) unsubscribe();
				if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			}
		});
	}*/

	/** Broadcast async to prevent listeners publishing new messages before all lsiters complete handling the first message */
	public publish<T extends AllowedMessages>(message: T): T {


		// Add to Queue (prevent publishing while previous message is not yet handled by all listeners)
		if (this.isPublishing) {
			this.publishQueue.push(message);
			return message;
		}

		try {
			const executeAfterCurrentMessageIsHandled: ((message: T) => void)[] = [];
			this.isPublishing = true;
			//console.log(`publish message: ${message.name}`, JSON.stringify(message)); // stringyfy so it can be copy/pasted for republis"

			this.listeners
			.slice(0) // First copy so unsubscribers don't manipulate the list iterating
			.forEach(listener => {
				listener(// Call listener
					message as any,

					// Pass the function tht can be called to delay handling after all listeners have processed the message
					listenerToAdd => {
						executeAfterCurrentMessageIsHandled.push(listenerToAdd);
					}
				);
			});

			// Handlers to delay
			// If the would broadcast messages, they will also be queued
			executeAfterCurrentMessageIsHandled.forEach(handler => {
				handler(message);
			});

		} finally {
			this.isPublishing = false;
		}

		// Handle queue recursive(broadcast nested messages)
		if (this.publishQueue.length > 0) {
			const nextMessage = this.publishQueue.shift();
			if (nextMessage) {
				this.publish(nextMessage);
			}
		}

		return message;

	}
}

export const broadcaster = new Broadcaster();
