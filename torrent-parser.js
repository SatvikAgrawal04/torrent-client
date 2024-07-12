"use strict";

import * as fs from "fs";
import bencode from "bencode";
import crypto from "crypto";

export const open = (filepath) => {
  return bencode.decode(fs.readFileSync(filepath));
};

export const size = (torrent) => {
  const size = torrent.info.files
    ? torrent.info.files
        .map((file) => BigInt(file.length))
        .reduce((a, b) => a + b)
    : BigInt(torrent.info.length);

  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(size);
  return buffer;
};

export const infoHash = (torrent) => {
  const info = bencode.encode(torrent.info);
  return crypto.createHash("sha1").update(info).digest();
};
