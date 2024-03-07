export const getJsonHeaders = (additionalHeaders = {}) => ({
  "content-type": "application/json",
  "access-control-allow-origin": "*",
  ...additionalHeaders,
});
