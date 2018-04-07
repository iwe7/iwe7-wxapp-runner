import Tips from "./tip";

function request(_open, method, params = {}, success) {
  const app = getApp();
  let url = app.util.url("entry/site/open", {
    m: app.siteInfo.name,
    open: _open
  });
  return app.util.request({
    url: url,
    method: method,
    data: JSON.stringify(params),
    header: {
      "content-type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    success: function(res) {
      success && success(res.data);
    }
  });
}

function serializeQueryParams(params) {
  const strParams = Object.keys(params).map(name => {
    const value = params[name];
    return Array.isArray(value)
      ? value.map(v => `${encodeUriQuery(name)}=${encodeUriQuery(v)}`).join("&")
      : `${encodeUriQuery(name)}=${encodeUriQuery(value)}`;
  });
  return strParams.length ? `${strParams.join("&")}` : "";
}

function encodeUriQuery(s) {
  return encodeUriString(s).replace(/%3B/gi, ";");
}

function encodeUriString(s) {
  return encodeURIComponent(s)
    .replace(/%40/g, "@")
    .replace(/%3A/gi, ":")
    .replace(/%24/g, "$")
    .replace(/%2C/gi, ",");
}

function get(_open, params = {}, success) {
  const app = getApp();
  let url = app.util.url("entry/site/open", {
    m: app.siteInfo.name,
    open: _open,
    ...params
  });
  return app.util.request({
    url: url,
    method: "GET",
    header: {
      "content-type": "multipart/form-data",
      accept: "application/json"
    },
    success: function(res) {
      success && success(res.data);
    }
  });
}

function post(_open, params = {}, success) {
  const app = getApp();
  let url = app.util.url("entry/site/open", {
    m: app.siteInfo.name,
    open: _open
  });
  return app.util.request({
    url: url,
    data: JSON.stringify(params),
    header: {
      "content-type": "multipart/form-data",
      accept: "application/json"
    },
    method: "POST",
    dataType: "json",
    responseType: "json",
    success: function(res) {
      success && success(res.data);
    }
  });
}

module.exports = {
  get: get,
  post: post
};
