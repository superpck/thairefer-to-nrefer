/// <reference path="../../typings.d.ts" />

import * as fastify from "fastify";
import * as HttpStatus from "http-status-codes";

const router = (fastify, {}, next) => {

  fastify.get("/", async (req: fastify.Request, res: fastify.Reply) => {
    res.send({ 
      apiName: 'Thai Refer to nRefer' ,
      clientIP: req.ip
    });
  });

  next();
};

module.exports = router;
