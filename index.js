import * as fs from "fs";
import bencode from "bencode";

const torrentFile = fs.readFileSync("puppy.torrent");
const torrent = bencode.decode(torrentFile);
console.log(torrent.toString("utf-8"));
