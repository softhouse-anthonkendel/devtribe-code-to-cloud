import {
  DynamoDBClient,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const AWS_REGION = process.env.AWS_REGION ?? "eu-north-1";
const AWS_DYNAMODB_ENDPOINT = process.env.AWS_DYNAMODB_ENDPOINT || undefined;

export const marshallToDbRecord = (data) =>
  marshall(data, {
    convertEmptyValues: true,
    convertClassInstanceToMap: true,
    removeUndefinedValues: true,
  });

export const unmarshallToJsObject = (data) => unmarshall(data);

const dynamoDbClient = new DynamoDBClient({
  region: AWS_REGION,
  endpoint: AWS_DYNAMODB_ENDPOINT,
});

export const dynamodbService = {
  async putAll(tableName, items = []) {
    const commands = items.map(
      (item) =>
        new PutItemCommand({
          Item: marshallToDbRecord(item),
          TableName: tableName,
        })
    );

    await Promise.all(commands.map((command) => dynamoDbClient.send(command)));

    const scanCommand = new ScanCommand({ TableName: tableName });
    const { Items = [] } = await dynamoDbClient.send(scanCommand);

    return Items.map(unmarshallToJsObject);
  },
};
