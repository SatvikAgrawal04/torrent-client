"use strict";

import dgram from "dgram";
import { Buffer } from "buffer";
import { parse as urlParse } from "url";
import crypto from "crypto";
import * as torrentParser from "./torrent-parser.js";
import * as util from "./util.js";

export const getPeers = (torrent, callback) => {
  const socket = dgram.createSocket("udp4");
  const url = String.fromCharCode(...torrent.announce);
  console.log(url);
  //1. Send connect request
  udpSend(socket, buildConnReq(), url);

  socket.on("message", (response) => {
    if (respType(response) === "connect") {
      //2. receive and parse connect response
      const connResp = parseConnResp(response);
      //3. Send announce request
      const announceReq = buildAnnounceReq(connResp.connectionId);
      udpSend(socket, announceReq, url);
    } else if (respType(response) === "announce") {
      //4. parse announce response
      const announceResp = parseAnnounceResp(response);
      //5. get peers to callback
      callback(announceResp.peers);
    }
  });
};

function udpSend(socket, message, rawUrl, callback = () => {}) {
  const url = urlParse(rawUrl);
  socket.send(message, 0, message.length, url.port, url.host, callback);
}

function respType(resp) {
  // Implementation needed
}

function buildConnReq() {
  const buf = Buffer.alloc(16);

  //connection id
  buf.writeBigUint64BE(BigInt("0x41727101980"), 0);

  //action
  buf.writeUInt32BE(0, 8);

  //transaction id
  const transactionId = crypto.randomBytes(4).readUInt32BE(0);
  buf.writeUint32BE(transactionId, 12);

  return buf;
}

function parseConnResp(resp) {
  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    connectionId: resp.slice(8),
  };
}

function buildAnnounceReq(connId, torrent, port = 6881) {
  const buf = Buffer.allocUnsafe(98);

  //connection id
  connId.copy(buf, 0);

  //action
  buf.writeUInt32BE(1, 8);

  //transaction id
  crypto.randomBytes(4).copy(buf, 12);

  //info hash
  torrentParser.infoHash(torrent).copy(buf, 16);

  //peer id
  util.genId().copy(buf, 36);

  //downloaded
  Buffer, alloc(8).copy(buf, 56);

  //left
  Buffer.from(
    BigInt(torrentParser.size(torrent)).toString(16).padStart(16, "0"),
    "hex"
  ).copy(buf, 64);

  //uploaded
  Buffer.alloc(8).copy(buf, 72);

  //event
  buf.writeUInt32BE(0, 80);

  //ip address
  buf.writeUInt32BE(0, 84);

  //key
  crypto.randomBytes(4).copy(buf, 88);

  //num want
  buf.writeInt32BE(-1, 92);

  //port
  buf.writeUInt16BE(port, 96);

  return buf;
}

function parseAnnounceResp(resp) {
  function group(iterable, groupSize) {
    let groups = [];
    for (let i = 0; i < iterable.length; i += groupSize) {
      groups.push(iterable.slice(i, i + groupSize));
    }
    return groups;
  }

  return {
    action: resp.readUInt32BE(0),
    transactionId: resp.readUInt32BE(4),
    leechers: resp.readUInt32BE(8),
    seeders: resp.readUInt32BE(12),
    peers: group(resp.slice(20), 6).map((address) => {
      return {
        id: address.slice(0, 4).join("."),
        port: address.readUInt16BE(4),
      };
    }),
  };
}