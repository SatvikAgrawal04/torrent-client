"use strict";

import crypto from "crypto";
let id = null;

export const genId = () => {
  if (!id) {
    id = crypto.randomBytes(20);
    Buffer.from("-TC0001-").copy(id, 0);
  }
  return id;
};
