import * as fs from "fs";
import bencode from "bencode";
import dgram from "dgram";
import { Buffer } from "buffer";
import urlParser from "url";

const torrentFile = fs.readFileSync("test.torrent");
const torrent = bencode.decode(torrentFile);

const url = urlParser.parse(torrent.announce.toString("utf-8"));

const socket = dgram.createSocket("udp4");
const myMsg = Buffer.from("Hello?", "utf-8");

console.log(url.port);

const port = url.port ? parseInt(url.port) : 80;

socket.send(myMsg, 0, myMsg.length, port, url.hostname, (err) => {
  if (err) {
    console.error(`Failed to send message: ${err}`);
  } else {
    console.log("Message sent!");
  }
});

// Set up a response listener
socket.on("message", (msg) => {
  console.log("message is", msg);
});
