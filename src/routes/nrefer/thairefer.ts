/// <reference path="../../../typings.d.ts" />

import * as Knex from "knex";
import * as fastify from "fastify";
import * as HttpStatus from "http-status-codes";

import { ThaiReferModel } from "../../models/thairefer";
const thairefer = new ThaiReferModel();

const router = (fastify, {}, next) => {
  var db: Knex = fastify.dbThaiRefer;

  fastify.get("/showTbl", { preHandler: [fastify.serviceMonitoring] },
    async (req: fastify.Request, res: fastify.Reply) => {
      try {
        const rows = await thairefer.getTableName(db);
        res.send({ statusCode: HttpStatus.OK, rows });
      } catch (error) {
        console.log("showTbl", error.message);
        res.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        });
      }
    }
  );

  fastify.post(
    "/sum-referOut",{ preHandler: [fastify.serviceMonitoring] },
    async (req: fastify.Request, res: fastify.Reply) => {
      const columnSearch = req.body.columnSearch;
      const valueSearch = req.body.valueSearch;

      if (columnSearch && valueSearch) {
        try {
          console.log(columnSearch, valueSearch);
          const rows = await thairefer.sumReferOutByDate(db, columnSearch, valueSearch);
          res.send({ statusCode: HttpStatus.OK, rowcount: rows.length, rows });
        } catch (error) {
          res.send({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message,
          });
        }
      } else {
        res.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Invalid parameter",
        });
      }
    }
  );

  fastify.post(
    "/referOut",
    { preHandler: [fastify.serviceMonitoring] },
    async (req: fastify.Request, res: fastify.Reply) => {
      const columnSearch = req.body.columnSearch;
      const valueSearch = req.body.valueSearch;

      if (columnSearch && valueSearch) {
        try {
          const rows = await thairefer.referOut(db, columnSearch, valueSearch);
          res.send({ statusCode: HttpStatus.OK, rowcount: rows.length, rows });
        } catch (error) {
          res.send({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message,
          });
        }
      } else {
        res.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Invalid parameter",
        });
      }
    }
  );

  fastify.post(
    "/person",
    { preHandler: [fastify.serviceMonitoring] },
    async (req: fastify.Request, res: fastify.Reply) => {
      const hospcode = req.body.hospcode;
      const columnSearch = req.body.columnSearch;
      const valueSearch = req.body.valueSearch;

      if (hospcode && columnSearch && valueSearch) {
        try {
          const rows = await thairefer.person(db, hospcode, columnSearch, valueSearch);
          res.send({ statusCode: HttpStatus.OK, rowcount: rows.length, rows });
        } catch (error) {
          console.log("person", error.message);
          res.send({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message,
          });
        }
      } else {
        res.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Invalid parameter",
        });
      }
    }
  );

  fastify.post("/address",{ preHandler: [fastify.serviceMonitoring] },
    async (req: fastify.Request, res: fastify.Reply) => {
      const hospcode = req.body.hospcode;
      const columnSearch = req.body.columnSearch;
      const valueSearch = req.body.valueSearch;

      if (hospcode && columnSearch && valueSearch) {
        try {
          const rows = await thairefer.address(db, hospcode, columnSearch, valueSearch);
          res.send({ statusCode: HttpStatus.OK, rowcount: rows.length, rows });
        } catch (error) {
          console.log("address", error.message);
          res.send({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message,
          });
        }
      } else {
        res.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Invalid parameter",
        });
      }
    }
  );

  fastify.post("/get-data",{ preHandler: [fastify.serviceMonitoring] },
    async (req: fastify.Request, res: fastify.Reply) => {
      const tableName = req.body.tableName;
      const hospcode = req.body.hospcode;
      const columnSearch = req.body.columnSearch;
      const valueSearch = req.body.valueSearch;

      if (tableName && hospcode) {
        try {
          const rows = await thairefer.getData(db, tableName, columnSearch, valueSearch, hospcode);
          res.send({ statusCode: HttpStatus.OK, rowcount: rows.length, rows });
        } catch (error) {
          console.log("get-data", error.message);
          res.send({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message,
          });
        }
      } else {
        res.send({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Invalid parameter",
        });
      }
    }
  );
  
  next();
};

module.exports = router;
