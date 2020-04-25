'use strict'

const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

AWS.config.update({ region: "eu-west-1" })

const TABLE = 'rooms';

const successfulResponse = {
  statusCode: 200,
  body: "All good"
}

module.exports.connectHandler = (event, context, callback) => {
  console.log(event)
  addConnection(event.requestContext.connectionId)
      .then(() => callback(null, successfulResponse))
      .catch(err => errorResponse("Failed to connect", err, callback));
}

module.exports.disconnectHandler = (event, context, callback) => {
  console.log(event)
  removeConnection(event.requestContext.connectionId)
      .then(() => callback(null, successfulResponse))
      .catch(err => errorResponse("Failed to disconnect", err, callback));
}

module.exports.messageHandler = (event, context, callback) => {
  console.log(event)
  sendMessage(event)
      .then(() => callback(null, successfulResponse))
      .catch(err => errorResponse("Failed to process message", err, callback));
}

module.exports.defaultHandler = (event, context, callback) => {
  console.log("defaultHandler was called: " + event)
  callback(null, successfulResponse);
}


function addConnection(connectionId) {
  console.log('Adding connection: ' + connectionId);
  return dynamo.put({
    TableName: TABLE,
    Item: {
      connectionId: connectionId
    }
  }).promise();
}

function removeConnection(connectionId) {
  console.log('Removing connection: ' + connectionId);
  return dynamo.delete({
    TableName: TABLE,
    Key: {
      connectionId: connectionId
    }
  }).promise();
}

function getConnectionIds() {
  return dynamo.scan({
    TableName: TABLE,
    ProjectionExpression: 'connectionId'
  }).promise();
}

function sendMessage(event) {
  return getConnectionIds().then(connectionData => {
    return connectionData.Items.map(connectionId => {
      return send(event, connectionId.connectionId);
    });
  });
}

function send(event, connectionId) {
  const body = JSON.parse(event.body);
  const postData = body.data;

  const gatewayApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: event.requestContext.domainName + "/" + event.requestContext.stage
  });

  return gatewayApi.postToConnection({
    ConnectionId: connectionId,
    Data: postData
  }).promise();
};


function errorResponse(message, err, callback) {
  console.error(err);
  callback(null, {
    statusCode: 500,
    body: message + ": " + JSON.stringify(err)
  });
}
