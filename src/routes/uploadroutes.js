const express = require("express");
const router = express.Router();
//const requireAuth = require("../middlewares/requireAuth");

const AWS = require("aws-sdk");
const { v1: uuid } = require("uuid");
const keys = require("../config/keys");

const s3 = new AWS.S3({
  accessKeyId: keys.accessKeyId,
  secretAccessKey: keys.secretAccessKey,
});

router.get("/upload", (req, res) => {
  let baseDir = req.query.type || "kpopway";
  let fileName = `${uuid()}.jpeg`;

  let key = `${baseDir}/${fileName}`;

  s3.getSignedUrl(
    "putObject",
    {
      Bucket: "smlv01",
      Key: key,
      ContentType: "image/jpeg",
    },
    (err, url) => {
      res.send({ key, url });
    }
  );
});

router.delete("/upload", (req, res) => {
  const key = req.query.key;

  s3.deleteObject(
    {
      Bucket: "smlv01",
      Key: key,
    },
    (err, data) => {
      res.send(data);
    }
  );
});

module.exports = router;
