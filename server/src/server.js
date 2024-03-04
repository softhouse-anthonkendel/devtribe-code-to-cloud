import http from "node:http";
import burgers from "./burgers.json" assert { type: "json" };

const PORT = process.env.PORT ?? 9090;
const HOSTNAME = process.env.HOSTNAME ?? 'localhost';

const server = http.createServer((_request, response) => {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify(burgers));
});

server.listen(PORT, HOSTNAME, () => {
  console.info(`server listening on http://${HOSTNAME}:${PORT}`);
});
