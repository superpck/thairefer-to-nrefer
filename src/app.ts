/// <reference path="../typings.d.ts" />

import path = require("path");
import * as HttpStatus from "http-status-codes";
import * as fastify from "fastify";
import * as moment from "moment";
var cron = require("node-cron");
var shell = require("shelljs");

require("dotenv").config({ path: path.join(__dirname, "../config") });

import { Server, IncomingMessage, ServerResponse } from "http";

import helmet = require("fastify-helmet");

const app: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({
  logger: { level: "error" },
  bodyLimit: 5 * 1048576,
});

app.register(require("fastify-formbody"));
app.register(require("fastify-cors"), {});
app.register(require("fastify-no-icon"));
app.register(helmet, { hidePoweredBy: { setTo: "PHP 5.2.0" } });

app.register(require("fastify-rate-limit"), {
  max: +process.env.MAX_CONNECTION_PER_MINUTE || 1000,
  timeWindow: "1 minute",
});

app.register(require("fastify-static"), {
  root: path.join(__dirname, "../public"),
  prefix: "/html",
});

app.register(require("fastify-jwt"), {
  secret: process.env.SECRET_KEY,
});

app.decorate("authenticate", async (request, reply) => {
  let token: string = null;

  if (
    request.headers.authorization &&
    request.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    token = request.headers.authorization.split(" ")[1];
  } else if (request.query && request.query.token) {
    token = request.query.token;
  } else if (request.body && request.body.token) {
    token = request.body.token;
  }

  try {
    const decoded = await request.jwtVerify(token);
  } catch (err) {
    reply.status(HttpStatus.UNAUTHORIZED).send({
      statusCode: HttpStatus.UNAUTHORIZED,
      error: HttpStatus.getStatusText(HttpStatus.UNAUTHORIZED),
      message: "Access denied!",
    });
  }
});

app.decorate("serviceMonitoring", async (request, reply) => {
  console.log(
    moment().locale("th").format("HH:mm:ss"),
    request.ip,
    request.raw.url
  );
  if (["127.0.0.1", "localhost"].indexOf(request.ip) < 0) {
    reply.send("localhost access only");
  }
});

// Database connect
const dbThaiReferOption = createConnectionOption({
  client: process.env.THAI_REFER_DB_CLIENT,
  host: process.env.THAI_REFER_DB_HOST,
  user: process.env.THAI_REFER_DB_USER,
  password: process.env.THAI_REFER_DB_PASSWORD,
  dbName: process.env.THAI_REFER_DB_NAME,
  port: process.env.THAI_REFER_DB_PORT,
  schema: process.env.THAI_REFER_DB_SCHEMA,
  charSet: process.env.THAI_REFER_DB_CHARSET,
  encrypt: process.env.THAI_REFER_DB_ENCRYPT || true,
  connectionName: "dbThaiRefer",
});
// app.register(require("fastify-knexjs"), dbThaiReferOption);
app.register(require('./plugins/db'), {
  connection: dbThaiReferOption,
  connectionName: 'dbThaiRefer'
});

// Route define
app.register(require("./routes/index"), { prefix: "/", logger: true });
app.register(require("./routes/nrefer/thairefer"), {
  prefix: "/nrefer",
  logger: true,
});

// node-cron =========================================
const apiVersion = '2.0.0';
const timingSch = "24 */1 * * * *"; // every minute
const timingSchedule = +process.env.AUTO_SEND_EVERY_MINUTE || 0;

// ตรวจสอบการ start ด้วยเวลาที่กำหนด
cron.schedule(timingSch, async (req, res) => {
  const minuteNow = +moment().get("minute") == 0 ? 60 : +moment().get("minute");

  if ( timingSchedule > 0 && minuteNow % timingSchedule == 0 ) {
    doAutoSend(req, res, "send to nrefer", "./routes/nrefer/crontab");
  }
});

async function doAutoSend(req, res, serviceName, functionName) {
  console.log(moment().locale("th").format("HH:mm:ss"), serviceName);
  let firstProcess: any = { pid: -1 };
  if (process.env.START_TOOL === "nodemon") {
    firstProcess.pid = process.pid;
  } else {
    var jlist: any = await shell.exec("pm2 jlist");
    let pm2Process = jlist && jlist !== "" ? JSON.parse(jlist) : [];

    let processList = [];
    for (let p of pm2Process) {
      if (p.name === process.env.PM2_NAME) {
        await processList.push(p);
      }
    }

    if (processList.length) {
      firstProcess = processList[0];
    }
  }

  if (firstProcess.pid === process.pid) {
    console.log(
      moment().locale("th").format("HH:mm:ss"),
      `start cronjob '${serviceName}' on PID ${process.pid}`
    );
    await require(functionName)(req, res, app.dbThaiRefer, { apiVersion, timingSchedule });
  }
}

const port = +process.env.PORT || 3000;
app.listen(port, (err) => {
  if (err) throw err;
  console.log(app.server.address());
});

function createConnectionOption(db: any) {
  if (["mssql"].includes(db.client)) {
    return {
      client: db.client,
      connection: {
        server: db.host,
        user: db.user,
        password: db.password,
        database: db.dbName,
        options: {
          port: +db.port,
          schema: db.schema,
          encrypt: db.encrypt == "true" || db.encrypt == true,
          enableArithAbort: db.enableArithAbort || true,
        },
      },
      connectionName: db.connectionName,
    };
  }
  if (db.client === "oracledb") {
    return {
      client: db.client,
      caseSensitive: false,
      connection: {
        connectString: `${db.host}/${db.schema}`,
        user: db.user,
        password: db.password,
        port: +db.port,
        externalAuth: false,
        fetchAsString: ["DATE"],
      },
      connectionName: db.connectionName,
    };
  } else {
    return {
      client: db.client,
      connection: {
        host: db.host,
        port: +db.port,
        user: db.user,
        password: db.password,
        database: db.dbName,
      },
      pool: {
        min: 0,
        max: 7,
        afterCreate: (conn, done) => {
          conn.query("SET NAMES " + db.charSet, (err) => {
            done(err, conn);
          });
        },
      },
      debug: false,
      connectionName: db.connectionName,
    };
  }
}
