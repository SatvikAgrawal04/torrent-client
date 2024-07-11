"use strict";

import * as fs from "fs";
import bencode from "bencode";
import * as tracker from "./tracker.js";
import { parse as urlParse } from "url";
import crypto from "crypto";

const torrentFile = fs.readFileSync("big-buck-bunny.torrent");
const torrent = bencode.decode(torrentFile);

// tracker.getPeers(torrent, (peers) => {
//   console.log("peers: ", peers);
// });

const buf = Buffer.alloc(16);

buf.writeUInt32BE(0x417, 0);
buf.writeUInt32BE(0x27101980, 4);
buf.writeUInt32BE(0, 8);
crypto.randomBytes(4).copy(buf, 12);
console.log(buf);

const buffer = Buffer.alloc(16);

// Fill the buffer with the specified data
buffer.writeBigUInt64BE(BigInt("0x41727101980"), 0); // connection_id
buffer.writeUInt32BE(0, 8); // action (connect)

// Generate a random 32-bit integer for transaction_id
const transactionId = crypto.randomBytes(4).readUInt32BE(0);
buffer.writeUInt32BE(transactionId, 12);

console.log(buffer);
