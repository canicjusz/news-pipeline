// https://github.com/brianc/node-postgres/blob/83a946f61cb9e74c7f499e44d03a268c399bd623/lib/client.js
function escapeLiteral(str) {
  let hasBackslash = false;
  let escaped = "'";

  if (typeof str !== "string") return str;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === "'") {
      escaped += c + c;
    } else if (c === "\\") {
      escaped += c + c;
      hasBackslash = true;
    } else {
      escaped += c;
    }
  }

  escaped += "'";

  if (hasBackslash === true) escaped = " E" + escaped;

  return escaped;
}

class ProcessConcurrently {
  argsList = [];
  constructor(cb, limit, cbThis = null) {
    this.cb = cb;
    this.limit = limit;
    this.cbThis = cbThis;
  }
  async push(val) {
    this.argsList.push(val);
    const reachedLimit = this.argsList.length >= this.limit;
    if (reachedLimit) {
      await this.#process();
    }
  }
  async #process() {
    await new Promise((res) => setTimeout(res, 1000 * Math.random()));
    const promises = this.argsList.map((args) =>
      this.cb.apply(this.cbThis, args)
    );
    this.argsList = [];
    await Promise.all(promises);
  }
}

export { escapeLiteral, ProcessConcurrently };
