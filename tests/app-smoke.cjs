const fs = require("node:fs");
const path = require("node:path");

const appRoot = { innerHTML: "" };

global.window = { scrollTo() {} };
global.document = {
  querySelector(selector) {
    return selector === "#app" ? appRoot : null;
  },
  querySelectorAll() {
    return [];
  },
  createElement() {
    return {
      className: "",
      textContent: "",
      remove() {}
    };
  },
  body: { append() {} }
};
global.localStorage = {
  value: "{invalid saved state",
  getItem() {
    return this.value;
  },
  setItem(_key, value) {
    this.value = value;
  },
  removeItem() {
    this.value = null;
  }
};
global.fetch = () =>
  Promise.reject(new Error("Speech fetch is not expected during initial render."));
global.Audio = function Audio() {};
global.URL = {
  createObjectURL() {
    return "blob:test";
  },
  revokeObjectURL() {}
};

const source = fs.readFileSync(
  path.resolve(__dirname, "..", "app.js"),
  "utf8"
);
eval(source);

if (!appRoot.innerHTML.includes("Detective Reader")) {
  throw new Error("The initial application render did not complete.");
}

if (!localStorage.value || localStorage.value.startsWith("{invalid")) {
  throw new Error("Invalid saved state was not recovered.");
}

console.log("Application data checks, saved-state recovery, and initial render passed.");
