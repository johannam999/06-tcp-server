'use strict';

const net = require('net');
const logger = require('./logger');
const faker = require('faker');
const uuid = require('uuid');

const app = net.createServer();

const server = module.exports = {};

let clientList = [];

class Client {
  constructor(socket) {
    this.id = uuid();
    this.nickname = faker.name.firstName();
    this.socket = socket;
  }
}

const parseCommand = (message, client) => {
  if (!message.startsWith('@')) {
    return false;
  }
  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `parsing a command ${command}`);

  switch (command) {
    case '@list': {
      const clientNames = clientList.map(user => user.nickname).join('\n');
      client.socket.write(`${clientNames}\n`);
      break;
    }
    case '@quit': {
      client.socket.end();
      break;
    }
    case '@nickname': {
      client.nickname = parsedMessage[1];
      client.socket.write();
      break;
    }
    case '@dm': {
      const name = parsedMessage[1];
      const receiver = clientList.filter(user => user.nickname === name)[0];
      const msg = parsedMessage.slice(2).join(' ');
      receiver.socket.write(`${client.nickname}: ${msg}`);
      break;
    }
    default:
      client.socket.write('wrong command');
      break;
  }
  return true;
};

const removeClient = client => () => {
  clientList = clientList.filter(user => user.id !== client.id);
  logger.log(logger.INFO, `remove ${client.nickname}`);
};

app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  socket.write('Hi, welcome to this chat\n');
  const client = new Client(socket);
  clientList.push(client);
 
  socket.write(`your name is ${client.id} and ${client.nickname}\n`);
  socket.on('data', (data) => {
    const message = data.toString().trim();
    logger.log(logger.INFO, `Processing a message: ${message}`);
    if (parseCommand(message, client)) {
      return;
    }
    clientList.forEach((user) => {
      user.socket.write(`${client.nickname}: ${message}\n`);
    });
  });
  socket.on('close', removeClient(client));
  socket.on('error', () => {
    logger.log(logger.ERROR, socket.name);
    removeClient(client)();
  });
});

server.start = () => {
  if (!process.env.PORT) {
    logger.log(logger.ERROR, 'missing  Port');
    throw new Error('missing Port');
  }
  logger.log(logger.INFO, `Server is up on Port ${process.env.PORT}`);
  return app.listen({ port: process.env.PORT }, () => {});
};

server.stop = () => {
  logger.log(logger.INFO, 'Server is offline');
  return app.close(() => {});
};
