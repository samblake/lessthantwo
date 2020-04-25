'use strict'

const AWS = require('aws-sdk');

AWS.config.update({ region: "eu-west-1" })
const dynamo = new AWS.DynamoDB.DocumentClient();

const TABLE = 'rooms';

const successfulResponse = {
  statusCode: 200,
  body: "All good"
}

module.exports.connectHandler = async event => {
  console.log(event)
  try {
    await addConnection(event.requestContext.connectionId)
    return successfulResponse;
  }
  catch (err) {
    return errorResponse("Failed to connect", err)
  }
}

module.exports.disconnectHandler = async event => {
  console.log(event)
  try {
    await removeConnection(event.requestContext.connectionId)
    return successfulResponse;
  }
  catch (err) {
    return errorResponse("Failed to disconnect", err)
  }
}

module.exports.messageHandler = async event => {
  console.log(event)
  try {
    await sendMessage(event)
    return successfulResponse;
  }
  catch (err) {
    return errorResponse("Failed to process message", err)
  }
}

module.exports.defaultHandler = async event => {
  console.log("defaultHandler was called: " + event)
  return successfulResponse;
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

async function sendMessage(event) {
  const connectionData = await dynamo.scan({
    TableName: TABLE,
    ProjectionExpression: 'connectionId'
  }).promise();

  const gatewayApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: event.requestContext.domainName + "/" + event.requestContext.stage
  });

  const calls = connectionData.Items.map(async ({ connectionId }) => {
    await gatewayApi.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.parse(event.body).data
    }).promise();
  });

  await Promise.all(calls);
}

function errorResponse(message, err) {
  console.error(err);
  return {
    statusCode: 500,
    body: message + ": " + JSON.stringify(err)
  };
}
