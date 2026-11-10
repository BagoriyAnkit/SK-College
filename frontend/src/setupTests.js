if (typeof TextDecoder === "undefined") {
  const { TextDecoder, TextEncoder } = require("util");
  global.TextDecoder = TextDecoder;
  global.TextEncoder = TextEncoder;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
