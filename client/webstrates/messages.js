'use strict';
const coreEvents = require('./coreEvents');
const coreUtils = require('./coreUtils');
const coreWebsocket = require('./coreWebsocket');
const globalObject = require('./globalObject');

const messagesModule = {};

// Create internal event that other modules may subscribe to
coreEvents.createEvent('messageReceived');
coreEvents.createEvent('messageSent');

// Create event in userland.
globalObject.createEvent('message');

const websocket = coreWebsocket.copy((event) => event.data.startsWith('{"wa":'));

let messages;

websocket.onjsonmessage = (message) => {
	switch (message.wa) {
		case 'hello':
			messages = message.messages || [];
			messages.forEach(message => Object.freeze(message));
			break;
		case 'message':
			Object.freeze(message);
			messages.push(message);
			coreEvents.triggerEvent('messageReceived', message);
			globalObject.triggerEvent('message', message.message, message.senderId, message.messageId);
			break;
	}
};

coreEvents.addEventListener('loadedTriggered', () => {
	if (messages.length > 0) {
		messages.forEach(message => {
			coreEvents.triggerEvent('messageReceived', message);
			globalObject.triggerEvent('message', message.message, message.senderId, message.messageId);
		});
	}
});

Object.defineProperty(globalObject.publicObject, 'messages', {
	get: () => {
		return coreUtils.objectCloneAndLock(messages);
	},
	set: () => {
		throw new Error('webstrate.messages is read-only. Use webstrate.deleteMessage(messageId) or ' +
			'webstrate.deleteMessages() to delete a message');
	}
});

Object.defineProperty(globalObject.publicObject, 'message', {
	value: (message, recipients) => {
		const msgObj = {
			wa: 'sendMessage',
			m: message,
			recipients
		};
		websocket.send(msgObj);
	},
	writable: false
});

function deleteMessages() {
	var length = messages.length;
	if (length === 0) return 0;

	messages = [];
	websocket.send({
		wa: 'deleteMessages'
	});

	return length;
}

Object.defineProperty(globalObject.publicObject, 'deleteMessage', {
	value: deleteMessage,
	writable: false
});

function deleteMessage(messageId) {
	var messageIndex = messages.findIndex(message => message.messageId === messageId);
	if (messageIndex === -1) return 0 ;

	messages.splice(messageIndex, 1);
	websocket.send({
		wa: 'deleteMessage', messageId
	});

	return 1;
}

Object.defineProperty(globalObject.publicObject, 'deleteMessages', {
	value: deleteMessages,
	writable: false
});

module.exports = messagesModule;