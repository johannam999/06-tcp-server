'use strict';

const net = require('net');
const logger = require('./logger');
const faker = require('faker');

const app = net.createServer();
let clients = [];

const parseCommand = (message, socket) => {
  if (!message.startsWith('@')) {
    return false;
  }
  const parsedMessage = message.split(' ');
  const command = parsedMessage[0];
  logger.log(logger.INFO, `parsing a command ${command}`);

  switch (command) {
    case '@list': {
    const clientNanmes = clients.map(client => client.name).join('\n');
    socket.write(`${clientNames}\n`);
    break;
    }
    default:
    socket.write('wrong command');
    break;
  }
  return true;
}

const removeClient = socket => () => {
  clients = clients.filter(client => client !==socket);
  logger.log(logger.INFO, `remove ${socket.name}`);
};

app.on('connection', (socket) => {
  logger.log(logger.INFO, 'new socket');
  clients.push(socket);
  socket.write('this is your chat\n');
  socket.name = faker.internet.userName();
  socket.write(`your name is ${socket.name}\n`);
  soocket.on('data', (data) => {
    const message = data.toString().trim();
    logger.log(logger.INFO, `processing  msg: ${message}`);
    if (parseCommand (message, cosket)) {
      return;
    }
    clients.forEach(client) => {
      if (client !== socket) {
        client.write(`${socket.name}: ${message}\n`);
      }
    });
  });
  socket.on('close', removeClient(socket));
  socket.on('error', () => {
    logger.log(logger.ERROR, socket.name);
    removeClient(socket)();
  });
});

const server = module.exports = {};
server.start = () => {
  if (!process.env.PORT) {
    logger.log(logger.ERROR, 'missing  Port');
    throw new Error ('missing Port');
  }
  logger.log(logger.INFO, `Server is up on Port ${process.env.PORT}`);
  return app.listen({ port: process.env.PORT }, () => {});
};

server.stop = () => {
  logger.log(logger.INFO, 'Server is offline');
  return app.close(() => {});
};
