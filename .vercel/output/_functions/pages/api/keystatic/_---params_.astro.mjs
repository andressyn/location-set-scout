import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic';
import { parseString } from 'set-cookie-parser';
import { config as config$1, collection, singleton, fields } from '@keystatic/core';
import { block, wrapper } from '@keystatic/core/content-components';
import { jsxs, jsx } from 'react/jsx-runtime';
export { renderers } from '../../../renderers.mjs';

function makeHandler(_config) {
  return async function keystaticAPIRoute(context) {
    var _context$locals, _ref, _config$clientId, _ref2, _config$clientSecret, _ref3, _config$secret;
    const envVarsForCf = (_context$locals = context.locals) === null || _context$locals === void 0 || (_context$locals = _context$locals.runtime) === null || _context$locals === void 0 ? void 0 : _context$locals.env;
    const handler = makeGenericAPIRouteHandler({
      ..._config,
      clientId: (_ref = (_config$clientId = _config.clientId) !== null && _config$clientId !== void 0 ? _config$clientId : envVarsForCf === null || envVarsForCf === void 0 ? void 0 : envVarsForCf.KEYSTATIC_GITHUB_CLIENT_ID) !== null && _ref !== void 0 ? _ref : tryOrUndefined(() => {
        return undefined                                          ;
      }),
      clientSecret: (_ref2 = (_config$clientSecret = _config.clientSecret) !== null && _config$clientSecret !== void 0 ? _config$clientSecret : envVarsForCf === null || envVarsForCf === void 0 ? void 0 : envVarsForCf.KEYSTATIC_GITHUB_CLIENT_SECRET) !== null && _ref2 !== void 0 ? _ref2 : tryOrUndefined(() => {
        return undefined                                              ;
      }),
      secret: (_ref3 = (_config$secret = _config.secret) !== null && _config$secret !== void 0 ? _config$secret : envVarsForCf === null || envVarsForCf === void 0 ? void 0 : envVarsForCf.KEYSTATIC_SECRET) !== null && _ref3 !== void 0 ? _ref3 : tryOrUndefined(() => {
        return undefined                                ;
      })
    }, {
      slugEnvName: "PUBLIC_KEYSTATIC_GITHUB_APP_SLUG"
    });
    const {
      body,
      headers,
      status
    } = await handler(context.request);
    let headersInADifferentStructure = /* @__PURE__ */ new Map();
    if (headers) {
      if (Array.isArray(headers)) {
        for (const [key, value] of headers) {
          if (!headersInADifferentStructure.has(key.toLowerCase())) {
            headersInADifferentStructure.set(key.toLowerCase(), []);
          }
          headersInADifferentStructure.get(key.toLowerCase()).push(value);
        }
      } else if (typeof headers.entries === "function") {
        for (const [key, value] of headers.entries()) {
          headersInADifferentStructure.set(key.toLowerCase(), [value]);
        }
        if ("getSetCookie" in headers && typeof headers.getSetCookie === "function") {
          const setCookieHeaders2 = headers.getSetCookie();
          if (setCookieHeaders2 !== null && setCookieHeaders2 !== void 0 && setCookieHeaders2.length) {
            headersInADifferentStructure.set("set-cookie", setCookieHeaders2);
          }
        }
      } else {
        for (const [key, value] of Object.entries(headers)) {
          headersInADifferentStructure.set(key.toLowerCase(), [value]);
        }
      }
    }
    const setCookieHeaders = headersInADifferentStructure.get("set-cookie");
    headersInADifferentStructure.delete("set-cookie");
    if (setCookieHeaders) {
      for (const setCookieValue of setCookieHeaders) {
        var _options$sameSite;
        const {
          name,
          value,
          ...options
        } = parseString(setCookieValue);
        const sameSite = (_options$sameSite = options.sameSite) === null || _options$sameSite === void 0 ? void 0 : _options$sameSite.toLowerCase();
        context.cookies.set(name, value, {
          domain: options.domain,
          expires: options.expires,
          httpOnly: options.httpOnly,
          maxAge: options.maxAge,
          path: options.path,
          sameSite: sameSite === "lax" || sameSite === "strict" || sameSite === "none" ? sameSite : void 0
        });
      }
    }
    return new Response(body, {
      status,
      headers: [...headersInADifferentStructure.entries()].flatMap(([key, val]) => val.map((x) => [key, x]))
    });
  };
}
function tryOrUndefined(fn) {
  try {
    return fn();
  } catch {
    return void 0;
  }
}

const IconList = [
	{
		label: "Dentista di qualità",
		value: "dentist-quality"
	},
	{
		label: "Sedia dentista",
		value: "dental-chair"
	},
	{
		label: "Pagamenti flessibili",
		value: "dentist-price"
	},
	{
		label: "Clinica dentale",
		value: "dental-clinic"
	},
	{
		label: "Whatsapp",
		value: "whatsapp"
	}
];

function GeneralIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: [
    /* @__PURE__ */ jsx("title", { children: "General" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#000",
        d: "M12.8838 5.07315C12.3957 4.58499 11.6042 4.58499 11.116 5.07315L9.32315 6.86604C8.83499 7.3542 8.83499 8.14565 9.32315 8.63381L11.116 10.4267C11.6042 10.9149 12.3957 10.9149 12.8838 10.4267L14.6767 8.63381C15.1649 8.14565 15.1649 7.3542 14.6767 6.86604L12.8838 5.07315zM8.63381 9.32315C8.14565 8.83499 7.3542 8.83499 6.86604 9.32315L5.07315 11.116C4.58499 11.6042 4.58499 12.3957 5.07315 12.8838L6.86604 14.6767C7.3542 15.1649 8.14565 15.1649 8.63381 14.6767L10.4267 12.8838C10.9149 12.3957 10.9149 11.6042 10.4267 11.116L8.63381 9.32315zM12.8838 13.5731C12.3957 13.085 11.6042 13.085 11.116 13.5731L9.32315 15.366C8.83499 15.8542 8.83499 16.6457 9.32315 17.1338L11.116 18.9267C11.6042 19.4149 12.3957 19.4149 12.8838 18.9267L14.6767 17.1338C15.1649 16.6457 15.1649 15.8542 14.6767 15.366L12.8838 13.5731zM17.1338 9.32315C16.6457 8.83499 15.8542 8.83499 15.366 9.32315L13.5731 11.116C13.085 11.6042 13.085 12.3957 13.5731 12.8838L15.366 14.6767C15.8542 15.1649 16.6457 15.1649 17.1338 14.6767L18.9267 12.8838C19.4149 12.3957 19.4149 11.6042 18.9267 11.116L17.1338 9.32315z"
      }
    )
  ] });
}
function ContactIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", "data-name": "Layer 1", viewBox: "0 0 512 512", id: "Mail", children: [
    /* @__PURE__ */ jsx("title", { children: "Contact" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M445.011,82.7H67.022a50.057,50.057,0,0,0-50,50V379.3a50.057,50.057,0,0,0,50,50H445.01a50.057,50.057,0,0,0,50-50V132.7A50.055,50.055,0,0,0,445.011,82.7Zm-88.9,173.232,118.9-93.318V371.352ZM67.022,102.7H445.01a30.034,30.034,0,0,1,30,30v4.49L282.6,288.208a39.972,39.972,0,0,1-49.246-.04L37.022,137.152V132.7A30.034,30.034,0,0,1,67.022,102.7Zm92.438,153.86L37.022,371.755V162.384ZM445.011,409.3H67.022a30.007,30.007,0,0,1-25.538-14.28l134.034-126.1L221.1,303.98a59.937,59.937,0,0,0,73.816-.019L340.235,268.4,470.6,394.94A30.011,30.011,0,0,1,445.011,409.3Z",
        fill: "#202020"
      }
    )
  ] });
}
function ContainerFluidIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", id: "Container", x: "0", y: "0", version: "1.1", viewBox: "0 0 128 128", children: [
    /* @__PURE__ */ jsx("title", { children: "Container Fluid" }),
    /* @__PURE__ */ jsxs("g", { fill: "#000000", children: [
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M70.9,26.8H54.1c-1.1,0-2-0.9-2-2V13.1c0-1.1,0.9-2,2-2h16.9c1.1,0,2,0.9,2,2v11.7    C72.9,25.9,72,26.8,70.9,26.8z M56.1,22.8h12.9v-7.7H56.1V22.8z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M57.6,15.1c-1.1,0-2-0.9-2-2V2.5c0-1.1,0.9-2,2-2s2,0.9,2,2v10.6C59.5,14.2,58.6,15.1,57.6,15.1z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M67.4,15.1c-1.1,0-2-0.9-2-2V2.5c0-1.1,0.9-2,2-2s2,0.9,2,2v10.6C69.4,14.2,68.5,15.1,67.4,15.1z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M63.2,46.6c-3.4,0-6.2-2.8-6.2-6.2c0-1.1,0.9-2,2-2s2,0.9,2,2c0,1.2,1,2.3,2.3,2.3c1.2,0,2.3-1,2.3-2.3    c0-1.2-1-2.3-2.3-2.3c-1.1,0-2-0.9-2-2V24.8c0-1.1,0.9-2,2-2c1.1,0,2,0.9,2,2v9.7c2.5,0.8,4.2,3.2,4.2,5.9    C69.5,43.8,66.7,46.6,63.2,46.6z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M16.1,75.4c-0.7,0-1.3-0.3-1.7-1c-0.6-0.9-0.3-2.2,0.7-2.7L63,42.9c0.6-0.4,1.4-0.4,2,0l47.9,28.8    c0.9,0.6,1.2,1.8,0.7,2.7c-0.6,0.9-1.8,1.2-2.7,0.7L64,46.9L17.1,75.1C16.8,75.3,16.5,75.4,16.1,75.4z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M114.8,127.5H13.2c-1.1,0-2-0.9-2-2V73.4c0-1.1,0.9-2,2-2h101.6c1.1,0,2,0.9,2,2v52.1    C116.8,126.6,115.9,127.5,114.8,127.5z M15.2,123.5h97.6V75.4H15.2V123.5z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M37.9,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C38.9,119.6,38.5,120,37.9,120z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M24.8,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C25.8,119.6,25.4,120,24.8,120z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M51,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C52,119.6,51.5,120,51,120z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M64,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C65,119.6,64.5,120,64,120z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M77,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C78,119.6,77.6,120,77,120z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M90.1,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C91.1,119.6,90.6,120,90.1,120z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M103.1,120c-0.5,0-1-0.4-1-1V79.9c0-0.5,0.4-1,1-1c0.5,0,1,0.4,1,1V119C104.1,119.6,103.7,120,103.1,120z"
        }
      ) })
    ] })
  ] });
}
function ContainerIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", id: "Container", x: "0", y: "0", version: "1.1", viewBox: "0 0 128 128", children: [
    /* @__PURE__ */ jsx("title", { children: "Container" }),
    /* @__PURE__ */ jsxs("g", { fill: "#000000", children: [
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M75.4,39.8H50.5c-1.1,0-2-0.9-2-2v-20c0-1.1,0.9-2,2-2h24.9c1.1,0,2,0.9,2,2v20    C77.3,38.9,76.5,39.8,75.4,39.8z M52.5,35.8h20.9v-16H52.5V35.8z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M67.4,30.9c-0.5,0-1-0.4-1-1v-3.1h-8c-0.5,0-1-0.4-1-1c0-0.5,0.4-1,1-1h9c0.5,0,1,0.4,1,1v4.1    C68.4,30.4,68,30.9,67.4,30.9z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M55.6,19.8c-1.1,0-2-0.9-2-2V2.5c0-1.1,0.9-2,2-2s2,0.9,2,2v15.4C57.6,18.9,56.7,19.8,55.6,19.8z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M70.2,19.8c-1.1,0-2-0.9-2-2V2.5c0-1.1,0.9-2,2-2c1.1,0,2,0.9,2,2v15.4C72.2,18.9,71.3,19.8,70.2,19.8z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M64,50c-4.5,0-8.2-3.7-8.2-8.2v-4c0-1.1,0.9-2,2-2h12.4c1.1,0,2,0.9,2,2v4C72.2,46.3,68.5,50,64,50z     M59.8,39.8v2c0,2.3,1.9,4.2,4.2,4.2c2.3,0,4.2-1.9,4.2-4.2v-2H59.8z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M64,69.1c-4.6,0-8.3-3.7-8.3-8.3c0-1.1,0.9-2,2-2s2,0.9,2,2c0,2.4,1.9,4.3,4.3,4.3c2.4,0,4.3-1.9,4.3-4.3    c0-2.4-1.9-4.3-4.3-4.3c-1.1,0-2-0.9-2-2V48c0-1.1,0.9-2,2-2c1.1,0,2,0.9,2,2v4.8c3.6,0.9,6.3,4.1,6.3,8    C72.3,65.4,68.6,69.1,64,69.1z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M89.1,127.5H38.9c-1.1,0-2-0.9-2-2V80.7c0-1.1,0.9-2,2-2h50.2c1.1,0,2,0.9,2,2v44.8    C91.1,126.6,90.2,127.5,89.1,127.5z M40.9,123.5h46.2V82.7H40.9V123.5z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M81.1,118.6c-0.5,0-1-0.4-1-1v-28H46.9c-0.5,0-1-0.4-1-1c0-0.5,0.4-1,1-1h34.3c0.5,0,1,0.4,1,1v28.9    C82.1,118.1,81.7,118.6,81.1,118.6z"
        }
      ) }),
      /* @__PURE__ */ jsx("g", { fill: "#000000", children: /* @__PURE__ */ jsx(
        "path",
        {
          fill: "#202020",
          d: "M76.6,82.7c-0.5,0-1.1-0.2-1.5-0.6L64,70L52.9,82c-0.7,0.8-2,0.9-2.8,0.1c-0.8-0.7-0.9-2-0.1-2.8l12.6-13.6    c0.8-0.8,2.2-0.8,2.9,0L78,79.3c0.7,0.8,0.7,2.1-0.1,2.8C77.6,82.5,77.1,82.7,76.6,82.7z"
        }
      ) })
    ] })
  ] });
}
function FlexboxIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 48 48", id: "Flexbox", children: [
    /* @__PURE__ */ jsx("title", { children: "Flexbox" }),
    /* @__PURE__ */ jsxs("g", { color: "#000", fill: "#202020", children: [
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M1603.2 620.97a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm3.8 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm3.9 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z",
          fill: "#b3b3b3",
          transform: "translate(-1591.9 -610.78)"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M1602.7 616.78a4.788 4.788 0 0 0-4.777 4.777v7.766a1 1 0 1 0 2 0v-7.766a2.75 2.75 0 0 1 2.777-2.777h26.445a2.75 2.75 0 0 1 2.778 2.777v12.338a1 1 0 1 0 2 0v-12.338a4.789 4.789 0 0 0-4.778-4.777zm-3.8 15.54a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 4a1 1 0 0 0-1 1V648a4.788 4.788 0 0 0 4.777 4.777h26.445A4.789 4.789 0 0 0 1633.9 648v-10.108a1 1 0 0 0-2 0V648a2.75 2.75 0 0 1-2.778 2.777h-26.445A2.75 2.75 0 0 1 1599.9 648v-10.68a1 1 0 0 0-1-1z",
          fill: "#959595",
          transform: "translate(-1591.9 -610.78)"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M1615.2 621.22a1 1 0 0 0 0 2h13.416a1 1 0 1 0 0-2z",
          fill: "#959595",
          transform: "translate(-1591.9 -610.78)"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          d: "M1617.9 638.78a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1zm0-12a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1zm-15 0a1 1 0 0 0-1 1v20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-20a1 1 0 0 0-1-1z",
          fill: "#b3b3b3",
          transform: "translate(-1591.9 -610.78)"
        }
      )
    ] })
  ] });
}
function HeroIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 100 100", children: [
    /* @__PURE__ */ jsx("title", { children: "Hero" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M88.974 44.991c-.285-.067-7.277-1.462-17.493-4.301-.872-.235-1.828.3-2.065 1.17l-.003.007c-.118.42-.067.873.151 1.277.218.386.589.671 1.009.789 7.512 2.084 13.326 3.412 16.166 4.018a51.776 51.776 0 0 1-1.142 4.789c-1.396 4.764-3.783 10.778-7.781 16.432L67.79 58.765a5.738 5.738 0 0 0-1.386-2.851L50.543 35.87a129.661 129.661 0 0 0 7.138 3.476c.824.37 1.85-.035 2.219-.858l.003-.012c.181-.399.197-.849.031-1.265a1.662 1.662 0 0 0-.875-.941c-5.672-2.531-10.737-5.39-13.362-6.941-1.321-1.525-3.568-2.163-5.503-1.504a10.382 10.382 0 0 0-.331-4.936c-.725-2.316-2.174-4.267-4.077-5.495-2-1.29-4.259-1.639-6.361-.978a7.077 7.077 0 0 0-2.535 1.429l-7.273-6.499a5.783 5.783 0 0 0-4.101-1.68h-.033a5.833 5.833 0 0 0-4.538 2.168c-.823.992-1.277 2.285-1.277 3.612 0 1.648.655 3.21 1.814 4.403l17.583 18.252c-.028.328-.052.658-.055.99 0 1.481.293 3.95 1.852 6.628 2.932 6.271 5.135 12.812 6.634 19.713a8.342 8.342 0 0 0-1.696 5.401 8.342 8.342 0 0 0 2.748 5.89c.065.059.135.113.208.161l.588.386c.364 3.687.556 7.476.573 11.382 0 .924.756 1.68 1.681 1.68h.117c5.472 0 10.319-.708 14.616-1.916l.482.316a5.858 5.858 0 0 0 4.04 1.6h.03a5.78 5.78 0 0 0 4.127-1.741c.87-.888 1.246-1.984 1.087-3.172a4.401 4.401 0 0 0-.237-.904 42.61 42.61 0 0 0 5.607-3.72l8.741 7.807a5.88 5.88 0 0 0 4.454 1.717 5.912 5.912 0 0 0 4.267-2.161c1.886-2.303 1.635-5.834-.549-8.019l-8.163-8.474a50.98 50.98 0 0 0 2.101-3.129c6.336-10.253 7.848-20.522 8.001-21.664v-.032a1.687 1.687 0 0 0-1.345-1.849zM86.33 86.03a2.507 2.507 0 0 1-1.833.932c-.721.058-1.398-.223-1.979-.801L74.055 78.6l-1.266-1.131-1.285-1.148-12.063-10.776a1.678 1.678 0 0 0-1.71-.32l-11.237 4.223a1.68 1.68 0 0 0-.418 2.918l11.686 8.772c.053.038.105.074.161.107a20.01 20.01 0 0 1 2.803 2.016c.5.431.953.872 1.306 1.291.41.486.686.943.736 1.314a.31.31 0 0 1-.042.23.688.688 0 0 1-.112.142c-.461.469-1.08.73-1.745.733-.06-.001-.121-.015-.18-.02-.593-.053-1.19-.285-1.63-.725a1.53 1.53 0 0 0-.266-.217l-.144-.095-1.819-1.193-14.323-9.398-1.786-1.172c-.018-.018-.034-.037-.052-.054a5.007 5.007 0 0 1-1.508-3.397 5 5 0 0 1 .581-2.55 5.09 5.09 0 0 1 .669-.978l.741-.506 7.03-4.8 6.152-2.051 3.096 3.712.051.051a6.275 6.275 0 0 0 4.622 2.066h.016a5.618 5.618 0 0 0 3.344-1.091 5.936 5.936 0 0 0 1.567-1.736l8.721 9.053 1.196 1.241 1.182 1.228 7.853 8.153c1 1.001 1.154 2.555.348 3.538zm-26.625-7.636-9.161-6.877 7.417-2.786 10.924 9.758a39.266 39.266 0 0 1-4.931 3.194c-1.578-1.633-3.551-2.875-4.249-3.289zm-16.442 8.544a121.274 121.274 0 0 0-.349-7.326l9.542 6.261a51.5 51.5 0 0 1-9.193 1.065zm-29.729-72.97c.504-.604 1.194-.941 1.966-.941.689 0 1.311.251 1.781.739l7.611 6.8c-.043.095-.093.185-.134.283-.863 2.093-.938 4.522-.213 6.837.163.521.363 1.019.593 1.492l-11.252-11.68a2.98 2.98 0 0 1-.857-2.052c.001-.57.169-1.074.505-1.478zm15.901 6.151c.308-.213.64-.384.997-.496a3.696 3.696 0 0 1 1.105-.167c.811 0 1.645.257 2.429.763 1.245.803 2.2 2.108 2.691 3.675.309.987.407 1.993.296 2.944a6.045 6.045 0 0 1-.41 1.607c-.028.067-.061.129-.09.194a4.68 4.68 0 0 1-.959 1.398c-.073.071-.15.134-.227.199a3.715 3.715 0 0 1-1.287.717c-.096.03-.193.049-.289.071-2.378.539-4.997-1.338-5.937-4.341-.392-1.253-.439-2.536-.156-3.701.071-.292.157-.578.271-.851.117-.285.257-.548.412-.793a4.174 4.174 0 0 1 1.154-1.219zm12.974 10.879c.37.131.692.381.898.74.028.21.092.411.198.596.043.076.089.152.145.222l.39.493 2.021 2.556 14.663 18.54 1.108 1.401 1.096 1.386.871 1.102.084.084c.404.469.638 1.058.638 1.68 0 .132-.012.259-.03.385a2.446 2.446 0 0 1-1.012 1.665c-.975.722-2.605.471-3.496-.52l-2.217-2.655-.001-.001-1.156-1.385-1.154-1.383-.002-.002-14.24-17.062a1.636 1.636 0 0 0-.437-.352c-.599-.343-1.39-.317-1.933.133a1.756 1.756 0 0 0-.211.221l-.057.076c-.448.616-.452 1.472.049 2.074 0 .016.017.016.017.016l13.38 16.038.003.003-4.156 1.386-.004-.004-11.878-11.608a14.024 14.024 0 0 1-1.762-2.092 11.164 11.164 0 0 1-.918-1.573 9.964 9.964 0 0 1-.436-1.107 9.344 9.344 0 0 1-.477-2.922l-.002-.035a8.31 8.31 0 0 1 .249-2.13c.116-.462.251-.832.356-1.08.151-.353.335-.671.504-.907.085-.084.135-.151.168-.184h.017l1.214-.609c.029-.008.057-.014.085-.023a7.082 7.082 0 0 0 2.107-1.076l1.163-.582 1.486-.744.131-.066 1.225-.614a1.52 1.52 0 0 1 .432-.152c.108-.021.216-.033.325-.033.193-.002.378.041.556.104zm-12.21 2.971c-.051.098-.102.2-.152.304l-.631-.655c.257.129.517.249.783.351zM44.79 60.114l-4.404 3.007a99.022 99.022 0 0 0-2.978-10.222l7.382 7.215zm18.288-19.071a1.682 1.682 0 0 1-.051-1.277l.007-.015c.309-.831 1.275-1.295 2.126-.994h.018c.866.301 1.3 1.26 1.013 2.129l-.006.023a1.692 1.692 0 0 1-1.58 1.109 1.64 1.64 0 0 1-.571-.102c-.017 0-.017 0-.033-.017a1.645 1.645 0 0 1-.923-.856z",
        fill: "#202020"
      }
    )
  ] });
}
function ProseIcon({ ariaHidden = true }) {
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 256 256", id: "Prose", children: [
    /* @__PURE__ */ jsx("title", { children: "Prose" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#e4e4e4",
        d: "M197.86,15.75v77.61c-5.47,6.64-10.12,17.9-12.21,31.1c-2.82,17.84-0.12,33.77,6.1,40.13l-2.87,18.09h-17.34\r\n	c-2.76,0-5,2.24-5,5v13.14h-10.51c-2.76,0-5,2.24-5,5v24.69H18.12c6.28,0,11.34-5.1,11.34-11.35V15.75\r\n	c0-6.24-5.06-11.34-11.34-11.34V4.4h168.4C192.8,4.4,197.86,9.5,197.86,15.75z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#c5c5c5",
        d: "M185.65 124.46c-2.82 17.84-.12 33.77 6.1 40.13l-2.87 18.09h-17.34c-2.76 0-5 2.24-5 5v13.14h-10.51c-2.76 0-5 2.24-5 5v24.69h-7v-24.69c0-6.62 5.38-12 12-12h3.51v-6.14c0-6.62 5.38-12 12-12h11.36l1.46-9.15c-13.74-20.17-5.39-69.06 13.5-82.86v9.69C192.39 100 187.74 111.26 185.65 124.46zM29.46 15.75V36.3H11.79c-2.76 0-5-2.24-5-5V16.11c0-6.25 4.9-11.6 11.15-11.7h.18C24.4 4.41 29.46 9.51 29.46 15.75zM29.458 219.164V198.61H11.794c-2.761 0-5 2.239-5 5l0 15.188c0 6.25 4.9 11.607 11.15 11.702C24.297 230.597 29.458 225.462 29.458 219.164z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M233.16,62.326c-3.729-1.228-6.641-2.022-8.591-10.421c-0.635-2.737-4.548-2.729-5.181,0\r\n	c-1.907,8.213-4.566,9.092-8.591,10.422c-2.424,0.801-2.43,4.248,0,5.051c6.686,2.209,7.444,5.476,8.591,10.421\r\n	c0.637,2.743,4.545,2.742,5.182,0c1.905-8.212,4.709-9.139,8.591-10.421C235.584,66.576,235.589,63.128,233.16,62.326z",
        fill: "#202020"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#888888",
        d: "M226.028,64.935c-1.47,1.04-2.79,2.42-3.93,4.44c-0.95-1.59-2.25-3.09-4.17-4.4\r\n	c1.55-1.06,2.94-2.51,4.12-4.64C223.248,62.495,224.618,63.925,226.028,64.935z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#afafaf",
        d: "M228.11,205.82v41.07c0,2.76-2.24,5-5,5h-67.08c-2.76,0-5-2.24-5-5v-41.07c0-2.76,2.24-5,5-5h67.08\r\n	C225.87,200.82,228.11,203.06,228.11,205.82z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#9c9c9c",
        d: "M220.86,130.04c-2.82,17.83-10.31,32.15-18.19,36.27l7.47-47.22c0.5-2.9-1.51-5.83-4.59-6.32\r\n	c-3.01-0.48-5.84,1.58-6.32,4.59l-7.48,47.23c-6.22-6.36-8.92-22.29-6.1-40.13c2.09-13.2,6.74-24.46,12.21-31.1\r\n	c3.72-4.52,7.82-6.89,11.76-6.27C219.34,88.63,224.37,107.86,220.86,130.04z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#afafaf",
        d: "M212.6,187.68v13.14h-46.06v-13.14c0-2.76,2.24-5,5-5h36.06C210.36,182.68,212.6,184.92,212.6,187.68z"
      }
    ),
    /* @__PURE__ */ jsx("rect", { width: "46.06", height: "7", x: "166.54", y: "193.82", fill: "#878787" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#efefef",
        d: "M210.14 119.09l-7.47 47.22-2.59 16.37h-11.2l2.87-18.09 7.48-47.23c.48-3.01 3.31-5.07 6.32-4.59C208.63 113.26 210.64 116.19 210.14 119.09zM212.1 238.26h-45.058c-1.657 0-3-1.343-3-3v-17.805c0-1.657 1.343-3 3-3H212.1c1.657 0 3 1.343 3 3v17.805C215.1 236.917 213.757 238.26 212.1 238.26z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        fill: "#ffffff",
        d: "M186.991 18.253h-3c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5h3c1.381 0 2.5 1.119 2.5 2.5S188.372 18.253 186.991 18.253zM173.991 18.253H41.787c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5h132.205c1.381 0 2.5 1.119 2.5 2.5S175.372 18.253 173.991 18.253zM136.667 222.086h-81.88c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5h81.88c1.381 0 2.5 1.119 2.5 2.5S138.048 222.086 136.667 222.086zM44.787 222.086h-3c-1.381 0-2.5-1.119-2.5-2.5s1.119-2.5 2.5-2.5h3c1.381 0 2.5 1.119 2.5 2.5S46.167 222.086 44.787 222.086z"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M48.119 36.611c-1.381 0-2.5 1.119-2.5 2.5v25.886c0 1.381 1.119 2.5 2.5 2.5h17.992c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5H50.619V39.111C50.619 37.73 49.5 36.611 48.119 36.611zM73.892 46.459V57.65c0 5.43 4.417 9.848 9.848 9.848h3.296c5.43 0 9.848-4.417 9.848-9.848V46.459c0-5.43-4.417-9.848-9.848-9.848H83.74C78.31 36.611 73.892 41.029 73.892 46.459zM78.892 46.459c0-2.673 2.175-4.848 4.848-4.848h3.296c2.673 0 4.848 2.175 4.848 4.848V57.65c0 2.673-2.175 4.848-4.848 4.848H83.74c-2.673 0-4.848-2.175-4.848-4.848V46.459zM125.157 46.769v-2.371c0-4.293-3.493-7.786-7.786-7.786h-12.706c-1.381 0-2.5 1.119-2.5 2.5 0 9.365 0 16.5 0 25.886 0 1.381 1.119 2.5 2.5 2.5s2.5-1.119 2.5-2.5V54.555h5.189l8.25 11.87c.788 1.133 2.345 1.414 3.479.626 1.134-.788 1.414-2.346.626-3.479l-6.318-9.091C122.203 53.978 125.157 50.715 125.157 46.769zM120.157 46.769c0 1.536-1.25 2.786-2.786 2.786h-10.206v-7.943h10.206c1.536 0 2.786 1.25 2.786 2.786V46.769zM150.93 41.611c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5h-17.992c-1.381 0-2.5 1.119-2.5 2.5v25.886c0 1.381 1.119 2.5 2.5 2.5h17.992c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5h-15.492v-7.943h15.492c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5h-15.492v-7.943H150.93zM179.202 67.498c1.381 0 2.5-1.119 2.5-2.5V39.111c0-2.441-3.162-3.432-4.553-1.427l-6.942 9.99-6.943-9.99c-1.392-2.005-4.553-1.014-4.553 1.427v25.886c0 1.381 1.119 2.5 2.5 2.5s2.5-1.119 2.5-2.5V47.089l4.443 6.393c.992 1.429 3.113 1.43 4.105 0l4.442-6.392v17.908C176.702 66.378 177.821 67.498 179.202 67.498zM76.463 93c0 1.381 1.119 2.5 2.5 2.5H164.5c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5H78.963C77.582 90.5 76.463 91.619 76.463 93zM67.644 90.5H48.12c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5h19.524c1.381 0 2.5-1.119 2.5-2.5S69.025 90.5 67.644 90.5zM45.62 109.09c0 1.381 1.119 2.5 2.5 2.5H164.5c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5H48.12C46.739 106.59 45.62 107.709 45.62 109.09zM141.369 166.94H78.963c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5h62.406c1.381 0 2.5-1.119 2.5-2.5S142.75 166.94 141.369 166.94zM48.12 171.94h19.524c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5H48.12c-1.381 0-2.5 1.119-2.5 2.5S46.739 171.94 48.12 171.94zM48.12 188.03h93.249c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5H48.12c-1.381 0-2.5 1.119-2.5 2.5S46.739 188.03 48.12 188.03zM48.12 127.68h60.61c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5H48.12c-1.381 0-2.5 1.119-2.5 2.5S46.739 127.68 48.12 127.68zM164.5 122.68h-44.451c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5H164.5c1.381 0 2.5-1.119 2.5-2.5S165.881 122.68 164.5 122.68zM167 141.271c0-1.381-1.119-2.5-2.5-2.5H48.12c-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5H164.5C165.881 143.771 167 142.651 167 141.271z",
        fill: "#202020"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M11.79 38.8h15.17v102.36c0 1.38 1.12 2.5 2.5 2.5 1.38 0 2.5-1.12 2.5-2.5 0-5.802 0-119.631 0-125.41 0-3.363-1.206-6.448-3.205-8.85H76.12c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5h-58c-7.528 0-13.83 6.36-13.83 14.21V31.3C4.29 35.436 7.654 38.8 11.79 38.8zM9.29 16.11c0-4.967 3.88-9.2 8.83-9.2 4.875 0 8.84 3.965 8.84 8.84V33.8H11.79c-1.378 0-2.5-1.122-2.5-2.5V16.11zM167.042 240.76h45.059c3.033 0 5.5-2.467 5.5-5.5v-17.805c0-3.033-2.467-5.5-5.5-5.5h-45.059c-3.033 0-5.5 2.467-5.5 5.5v17.805C161.542 238.292 164.009 240.76 167.042 240.76zM166.542 217.455c0-.276.225-.5.5-.5h45.059c.275 0 .5.224.5.5v17.805c0 .276-.225.5-.5.5h-45.059c-.275 0-.5-.224-.5-.5V217.455z",
        fill: "#202020"
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M176.693 228.857h25.756c1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5h-25.756c-1.381 0-2.5 1.119-2.5 2.5S175.312 228.857 176.693 228.857zM219.18 109.63c.12 1.29 1.18 2.26 2.48 2.26 1.496 0 2.621-1.286 2.489-2.72v-.01c-.13-1.37-1.35-2.39-2.72-2.26C220.068 107.022 219.035 108.249 219.18 109.63z",
        fill: "#202020"
      }
    ),
    /* @__PURE__ */ jsx("circle", { cx: "29.46", cy: "151.16", r: "2.5", fill: "#202020" }),
    /* @__PURE__ */ jsx("circle", { cx: "86.12", cy: "4.4", r: "2.5", fill: "#202020" }),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M156.03,254.39h67.08c4.136,0,7.5-3.364,7.5-7.5v-41.07c0-4.136-3.364-7.5-7.5-7.5H215.1v-10.64c0-4.136-3.364-7.5-7.5-7.5\r\n	h-4.593l1.948-12.313c8.324-5.264,15.621-20.027,18.375-37.437c0,0,0-0.001,0-0.002c0.58-3.69,0.939-7.369,1.08-10.949\r\n	c0.058-1.332-0.957-2.536-2.4-2.6c-1.39-0.06-2.54,1.02-2.59,2.41c-0.13,3.39-0.48,6.87-1.03,10.36c0,0.003,0,0.005,0,0.008\r\n	c-2.041,12.899-6.753,24.394-12.231,30.6c0.028-0.179,6.392-40.409,6.448-40.763c0.719-4.226-2.173-8.479-6.663-9.193\r\n	c-4.366-0.697-8.483,2.278-9.182,6.667l-6.461,40.777c-3.289-7.602-4.22-19.995-2.18-32.895\r\n	c1.931-12.198,6.293-23.376,11.671-29.903c3.228-3.922,6.585-5.836,9.436-5.389c0.001,0,0.002,0,0.003,0.001\r\n	c4.336,0.691,6.974,6.468,8.221,10.72c0.392,1.328,1.828,2.083,3.109,1.69c1.33-0.394,2.085-1.778,1.69-3.11\r\n	c-1.901-6.392-5.652-13.199-12.24-14.24c-0.003,0-0.006,0-0.01,0c-3.216-0.502-6.481,0.474-9.64,2.836V15.75\r\n	c0-7.637-6.209-13.85-13.841-13.85h-90.4c-1.38,0-2.5,1.12-2.5,2.5s1.12,2.5,2.5,2.5h90.4c4.875,0,8.841,3.97,8.841,8.85v76.749\r\n	c-5.728,7.333-10.151,18.76-12.18,31.571c-2.752,17.409-0.372,33.707,5.913,41.291l-2.348,14.819H171.54c-4.136,0-7.5,3.364-7.5,7.5\r\n	v10.64h-8.01c-4.136,0-7.5,3.364-7.5,7.5v22.19H28.758c2.003-2.439,3.202-5.518,3.202-8.85v0v0v-58c0-1.38-1.12-2.5-2.5-2.5\r\n	c-1.38,0-2.5,1.12-2.5,2.5v34.95H11.794c-4.136,0-7.5,3.364-7.5,7.5v15.188c0,7.717,6.106,14.087,13.611,14.202\r\n	c0.889,0.016,129.735,0.011,130.625,0.011v13.88C148.53,251.026,151.895,254.39,156.03,254.39z M9.294,218.798V203.61\r\n	c0-1.378,1.122-2.5,2.5-2.5h15.163v18.054c0,4.903-4.028,8.914-8.976,8.836C13.191,227.927,9.294,223.799,9.294,218.798z\r\n	 M201.699,117.753c0.262-1.645,1.807-2.778,3.458-2.515c1.694,0.27,2.786,1.879,2.513,3.46c-2.364,14.945-9.083,57.417-9.726,61.481\r\n	h-6.137L201.699,117.753z M169.04,187.68c0-1.378,1.121-2.5,2.5-2.5c3.857,0,32.434,0,36.06,0c1.379,0,2.5,1.122,2.5,2.5v10.64\r\n	h-41.06V187.68z M153.53,205.82c0-1.378,1.121-2.5,2.5-2.5c6.82,0,59.328,0,67.08,0c1.379,0,2.5,1.122,2.5,2.5v41.07\r\n	c0,1.378-1.121,2.5-2.5,2.5h-67.08c-1.379,0-2.5-1.122-2.5-2.5V205.82z",
        fill: "#202020"
      }
    )
  ] });
}

const BrandMarkComponent = ({ colorScheme }) => {
  const style = { fill: colorScheme === "dark" ? "#fff" : "#000" };
  return /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 750 750", width: 50, style, children: [
    /* @__PURE__ */ jsx("title", { children: "Brand mark" }),
    /* @__PURE__ */ jsx("path", { d: "M375,632.82a257.81,257.81,0,1,1,182.31-75.51A256.16,256.16,0,0,1,375,632.82Zm0-475.64c-120.11,0-217.82,97.71-217.82,217.82S254.89,592.82,375,592.82,592.82,495.11,592.82,375,495.11,157.18,375,157.18Z" }),
    /* @__PURE__ */ jsx("path", { d: "M374.85,547.47a48.65,48.65,0,0,1-48.59-48.59V251.12a48.59,48.59,0,1,1,97.18,0V498.88A48.65,48.65,0,0,1,374.85,547.47Zm0-304.94a8.6,8.6,0,0,0-8.59,8.59V498.88a8.59,8.59,0,1,0,17.18,0V251.12A8.6,8.6,0,0,0,374.85,242.53Z" }),
    /* @__PURE__ */ jsx("path", { d: "M273.8,495.11a48.77,48.77,0,0,1-8.32-.71A48.23,48.23,0,0,1,234,474.56h0a48.59,48.59,0,0,1,11.63-67.72L448,263.81a48.59,48.59,0,1,1,56.1,79.35l-202.31,143A48.3,48.3,0,0,1,273.8,495.11ZM476,294.9a8.52,8.52,0,0,0-4.95,1.57l-202.31,143a8.6,8.6,0,0,0-2.06,12h0a8.6,8.6,0,0,0,12,2.06L481,310.5A8.59,8.59,0,0,0,477.46,295,8.41,8.41,0,0,0,476,294.9Z" }),
    /* @__PURE__ */ jsx("path", { d: "M475.91,495.11a48.27,48.27,0,0,1-28-8.92l-202.31-143a48.59,48.59,0,1,1,56.1-79.35l202.31,143a48.59,48.59,0,0,1-19.83,87.56A48.86,48.86,0,0,1,475.91,495.11ZM273.71,294.9a8.45,8.45,0,0,0-1.47.12,8.59,8.59,0,0,0-3.5,15.48l202.31,143a8.59,8.59,0,0,0,12-2.06h0a8.6,8.6,0,0,0-2-12l-202.32-143A8.47,8.47,0,0,0,273.71,294.9Z" })
  ] });
};

const config = config$1({
  storage: {
    kind: "local"
  },
  ui: {
    brand: {
      name: "Your Company",
      mark: BrandMarkComponent
    }
  },
  singletons: {
    header: singleton({
      label: "Navigation",
      path: "src/content/global/header",
      format: { data: "json" },
      schema: {
        logo: fields.object({
          imagePath: fields.image({
            label: "Logo",
            directory: "src/assets/global",
            publicPath: "/src/assets/global/",
            validation: {
              isRequired: false
            }
          }),
          title: fields.text({ label: "Title" })
        }),
        pages: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            link: fields.text({ label: "Url" })
          }),
          // Labelling options
          {
            label: "Pages",
            itemLabel: (props) => props.fields.title.value
          }
        ),
        actions: fields.array(
          fields.object({
            title: fields.text({ label: "Title" }),
            link: fields.text({ label: "Url" }),
            style: fields.select({
              label: "Style",
              options: [
                { label: "Filled", value: "button" },
                { label: "Outlined", value: "outline" }
              ],
              defaultValue: "button"
            })
          }),
          // Labelling options
          {
            label: "Actions",
            itemLabel: (props) => props.fields.title.value
          }
        ),
        contacts: fields.object(
          {
            phone: fields.text({ label: "Phone" }),
            mail: fields.text({ label: "Email" }),
            address: fields.text({ label: "Address" })
          },
          {
            label: "Contacts"
          }
        ),
        socials: fields.array(
          fields.object({
            icon: fields.text({ label: "Icon" }),
            link: fields.text({ label: "Url" })
          }),
          {
            itemLabel: (props) => props.fields.link.value,
            label: "Social"
          }
        )
      }
    }),
    widget: singleton({
      label: "Whatsapp widget",
      path: "src/content/global/widget",
      format: { data: "json" },
      schema: {
        enabled: fields.checkbox({ label: "Abilita" }),
        icon: fields.select({
          label: "Icona",
          options: IconList,
          defaultValue: "whatsapp"
        }),
        link: fields.url({ label: "Link" })
      }
    }),
    footer: singleton({
      label: "Footer",
      path: "src/content/global/footer",
      format: { data: "json" },
      schema: {
        title: fields.text({ label: "Title" }),
        subtitle: fields.text({ label: "Subtitle" }),
        copyright: fields.text({ label: "Copyright" }),
        contacts: fields.object(
          {
            phone: fields.text({ label: "Phone" }),
            mail: fields.text({ label: "Email" }),
            socials: fields.array(
              fields.object({
                title: fields.text({ label: "Title" }),
                link: fields.text({ label: "Url" }),
                icon: fields.text({ label: "Icon" })
              }),
              {
                label: "Social",
                itemLabel: (props) => props.fields.title.value ?? "Imposta un titolo"
              }
            )
          },
          {
            label: "Contacts"
          }
        )
      }
    })
  },
  collections: {
    pages: collection({
      label: "Pages",
      slugField: "title",
      path: "src/content/pages/it/*",
      entryLayout: "content",
      columns: ["title", "lastUpdateDate"],
      previewUrl: "/{slug}",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            description: "Titolo della pagina",
            validation: {
              isRequired: true
            }
          },
          // Optional slug label overrides
          slug: {
            label: "SEO-friendly slug",
            description: "Slug da usare per la pagina, attenzione, è consigliato non modificarlo dopo la pubblicazione."
          }
        }),
        subtitle: fields.text({
          label: "Subtitle",
          multiline: true
        }),
        cover: fields.image({
          label: "Cover Image",
          directory: "src/assets/pages",
          publicPath: "@/assets/pages/"
        }),
        type: fields.select({
          label: "Tipo pagina",
          options: [
            {
              label: "Informativa",
              value: "informational"
            },
            {
              label: "Servizio",
              value: "service"
            },
            {
              label: "Contatti/supporto",
              value: "support"
            },
            {
              label: "Blog",
              value: "blog"
            },
            {
              label: "Termini e condizioni",
              value: "terms"
            }
          ],
          defaultValue: "informational"
        }),
        lastUpdateDate: fields.date({
          label: "Last Update Date",
          description: "Data dell'ultimo aggiornamento della pagina",
          defaultValue: {
            kind: "today"
          },
          validation: {
            isRequired: true
          }
        }),
        hideTitle: fields.checkbox({
          label: "Nascondi titolo",
          defaultValue: false
        }),
        addPadding: fields.checkbox({
          label: "Aggiungi padding",
          defaultValue: true
        }),
        seo: fields.object(
          {
            title: fields.text({
              label: "Titolo SEO",
              validation: {
                isRequired: true,
                length: {
                  // min: 10,
                }
              }
            }),
            description: fields.text({
              label: "Descrizione SEO",
              multiline: true,
              validation: {
                isRequired: true,
                length: {
                  // min: 50,
                }
              }
            }),
            author: fields.relationship({
              label: "Author",
              description: "Autore della pagina",
              collection: "authors",
              validation: {
                isRequired: true
              }
            })
          },
          {
            label: "SEO",
            description: "Opzioni SEO per la pagina"
          }
        ),
        content: fields.markdoc({
          label: "Content",
          options: {
            heading: [2, 3, 4, 5, 6],
            image: {
              directory: "src/assets/pages",
              publicPath: "/src/assets/pages/"
            }
          },
          components: {
            Container: wrapper({
              label: "Contenitore",
              icon: ContainerIcon({ ariaHidden: true }),
              description: "Contenitore che ti consente di agiungere del margine a destra e sinistra",
              schema: {
                class: fields.text({
                  label: "Classi custom"
                })
              }
            }),
            ContainerFluid: wrapper({
              label: "Contenitore largo",
              icon: ContainerFluidIcon({ ariaHidden: true }),
              description: "Contenitore che ti consente di avere del margine a destra e sinistra",
              schema: {
                class: fields.text({
                  label: "Classi custom"
                })
              }
            }),
            Prose: wrapper({
              label: "Prosa",
              icon: ProseIcon({ ariaHidden: true }),
              description: "Contenitore di testo, ideale per blog o per contenuti informativi",
              schema: {
                class: fields.text({
                  label: "Classi custom"
                })
              }
            }),
            Flex: wrapper({
              label: "Flexbox",
              icon: FlexboxIcon({ ariaHidden: true }),
              description: "Contenitore flessibile",
              schema: {
                class: fields.text({
                  label: "Classi custom",
                  description: "Aggiungi classi personalizzate al contenitore"
                }),
                direction: fields.select({
                  label: "Direzione",
                  description: "Scegli la direzione del contenitore",
                  options: [
                    { label: "Da sinistra a destra", value: "ltr" },
                    { label: "Da destra a sinistra", value: "rtl" },
                    { label: "Dall'alto in basso", value: "ttb" },
                    { label: "Dal basso in alto", value: "btt" }
                  ],
                  defaultValue: "ltr"
                }),
                verticalAlign: fields.select({
                  label: "Allineamento verticale",
                  description: "Scegli l'allineamento verticale del contenitore",
                  options: [
                    { label: "In alto", value: "top" },
                    { label: "Al centro", value: "middle" },
                    { label: "In basso", value: "bottom" },
                    { label: "Espandi", value: "stretch" },
                    { label: "Spaziato", value: "spaceBetween" },
                    { label: "Spaziato intorno", value: "spaceAround" }
                  ],
                  defaultValue: "top"
                }),
                horizontalAlign: fields.select({
                  label: "Allineamento orizzontale",
                  description: "Scegli l'allineamento orizzontale del contenitore",
                  options: [
                    { label: "A sinistra", value: "left" },
                    { label: "Al centro", value: "center" },
                    { label: "A destra", value: "right" },
                    { label: "Spaziato", value: "spaceBetween" },
                    { label: "Spaziato intorno", value: "spaceAround" },
                    { label: "Spaziato uniformemente", value: "spaceEvenly" }
                  ],
                  defaultValue: "left"
                }),
                itemsAlignment: fields.select({
                  label: "Allineamento oggetti",
                  description: "Scegli l'allineamento degli oggetti all'interno del contenitore",
                  options: [
                    { label: "All'inizio", value: "start" },
                    { label: "Al centro", value: "center" },
                    { label: "Alla fine", value: "end" },
                    { label: "Espandi", value: "stretch" },
                    { label: "Alla base del testo", value: "baseline" }
                  ],
                  defaultValue: "start"
                }),
                gap: fields.number({
                  label: "Spaziatura",
                  description: "Scegli lo spazio tra gli oggetti",
                  defaultValue: 0
                }),
                wrap: fields.checkbox({
                  label: "Vai a capo",
                  description: "Scegli se andare a capo o meno quando non c'è più spazio nel contenitore",
                  defaultValue: false
                })
              }
            }),
            Hero: block({
              label: "Hero",
              description: "Sezione hero dell'homepage",
              icon: HeroIcon({ ariaHidden: true }),
              schema: {
                title: fields.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                subtitle: fields.text({
                  label: "Subtitle",
                  validation: {
                    isRequired: true
                  }
                }),
                buttons: fields.array(
                  fields.object({
                    title: fields.text({ label: "Title" }),
                    href: fields.text({ label: "Url" }),
                    style: fields.select({
                      label: "Style",
                      options: [
                        { label: "Filled", value: "button" },
                        { label: "Outlined", value: "outline" }
                      ],
                      defaultValue: "button"
                    }),
                    icon: fields.text({ label: "Icona" })
                  }),
                  // Labelling options
                  {
                    label: "Actions",
                    itemLabel: (props) => props.fields.title.value
                  }
                )
              }
            }),
            LogoCloud: block({
              label: "LogoCloud",
              description: "LogoCloud",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                title: fields.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                logos: fields.array(
                  fields.image({
                    label: "Logo",
                    directory: "src/assets/pages",
                    publicPath: "/src/assets/pages/"
                  }),
                  {
                    label: "Loghi"
                  }
                )
              }
            }),
            Services: block({
              label: "Services",
              description: "Services",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                title: fields.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                services: fields.array(
                  fields.object({
                    title: fields.text({ label: "Title" }),
                    description: fields.text({ label: "Description", multiline: true }),
                    icon: fields.image({
                      label: "Icona",
                      directory: "src/assets/pages",
                      publicPath: "/src/assets/pages/"
                    })
                  }),
                  // Labelling options
                  {
                    label: "Servizi",
                    itemLabel: (props) => props.fields.title.value
                  }
                )
              }
            }),
            VideoEffect: block({
              label: "VideoEffect",
              description: "VideoEffect",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {}
            }),
            RecentWork: block({
              label: "RecentWork",
              description: "RecentWork",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                title: fields.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                buttons: fields.array(
                  fields.object({
                    title: fields.text({ label: "Title" }),
                    href: fields.text({ label: "Url" }),
                    style: fields.select({
                      label: "Style",
                      options: [
                        { label: "Filled", value: "button" },
                        { label: "Outlined", value: "outline" }
                      ],
                      defaultValue: "button"
                    }),
                    icon: fields.text({ label: "Icona" })
                  }),
                  // Labelling options
                  {
                    label: "Actions",
                    itemLabel: (props) => props.fields.title.value
                  }
                )
              }
            }),
            Testimonial: block({
              label: "Testimonial",
              description: "Testimonial",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                testimonial: fields.text({
                  label: "Testimonial",
                  multiline: true,
                  validation: {
                    isRequired: true
                  }
                }),
                name: fields.text({
                  label: "Name",
                  validation: {
                    isRequired: true
                  }
                })
              }
            }),
            Results: block({
              label: "Results",
              description: "Results",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                title: fields.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                results: fields.array(
                  fields.object({
                    label: fields.text({ label: "Label" }),
                    value: fields.text({ label: "Value" })
                  }),
                  // Labelling options
                  {
                    label: "Risultati",
                    itemLabel: (props) => props.fields.label.value
                  }
                )
              }
            }),
            BlogLatest: block({
              label: "BlogLatest",
              description: "BlogLatest",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                title: fields.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                })
              }
            }),
            About: block({
              label: "About",
              description: "About section",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {
                title: fields.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                subtitle: fields.text({
                  label: "Subtitle",
                  validation: {
                    isRequired: true
                  }
                }),
                content: fields.text({
                  label: "Content",
                  multiline: true,
                  validation: {
                    isRequired: true
                  }
                })
              }
            }),
            Works: block({
              label: "Works",
              description: "Works section",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {}
            }),
            News: block({
              label: "News",
              description: "News section",
              icon: GeneralIcon({ ariaHidden: true }),
              schema: {}
            }),
            Contact: block({
              label: "Contact",
              description: "Contact form section",
              icon: ContactIcon({ ariaHidden: true }),
              schema: {
                title: fields.text({
                  label: "Title",
                  validation: {
                    isRequired: true
                  }
                }),
                fields: fields.array(
                  fields.object({
                    label: fields.text({ label: "Label" }),
                    placeholder: fields.text({ label: "Placeholder" }),
                    width: fields.number({ label: "Width" }),
                    type: fields.select({
                      label: "Type",
                      options: [
                        { label: "Text", value: "text" },
                        { label: "Email", value: "email" },
                        { label: "Textarea", value: "textarea" }
                      ],
                      defaultValue: "text"
                    }),
                    required: fields.checkbox({ label: "Required" })
                  }),
                  {
                    label: "Fields",
                    itemLabel: (props) => props.fields.label.value
                  }
                )
              }
            })
          }
        })
      }
    }),
    posts: collection({
      label: "Posts",
      slugField: "title",
      path: "src/content/posts/it/*",
      entryLayout: "content",
      columns: ["title", "lastUpdateDate"],
      previewUrl: "/post/{slug}",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            description: "Titolo del post",
            validation: {
              isRequired: true
            }
          },
          // Optional slug label overrides
          slug: {
            label: "SEO-friendly slug",
            description: "Slug da usare per il post, attenzione, è consigliato non modificarlo dopo la pubblicazione."
          }
        }),
        description: fields.text({
          label: "Description",
          multiline: true,
          validation: {
            isRequired: true
          }
        }),
        author: fields.relationship({
          label: "Author",
          description: "Autore dell'articolo",
          collection: "authors",
          validation: {
            isRequired: true
          }
        }),
        cover: fields.image({
          label: "Cover Image",
          directory: "src/assets/posts",
          publicPath: "@/assets/posts/"
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tag",
          itemLabel: (props) => props.value
        }),
        pubDate: fields.date({
          label: "Publication Date",
          description: "Data di pubblicazione dell'articolo",
          defaultValue: {
            kind: "today"
          },
          validation: {
            isRequired: true
          }
        }),
        lastUpdateDate: fields.date({
          label: "Last Update Date",
          description: "Data dell'ultimo aggiornamento dell'articolo'",
          defaultValue: {
            kind: "today"
          },
          validation: {
            isRequired: true
          }
        }),
        hidden: fields.checkbox({
          label: "Hidden"
        }),
        content: fields.markdoc({
          label: "Content",
          options: {
            heading: [2, 3, 4, 5, 6],
            image: {
              directory: "src/assets/posts",
              publicPath: "/src/assets/posts/"
            }
          },
          components: {}
        })
      }
    }),
    works: collection({
      label: "Works",
      slugField: "title",
      path: "src/content/works/it/*",
      entryLayout: "content",
      columns: ["title", "lastUpdateDate"],
      previewUrl: "/works/{slug}",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({
          name: {
            label: "Title",
            description: "Titolo del post",
            validation: {
              isRequired: true
            }
          },
          // Optional slug label overrides
          slug: {
            label: "SEO-friendly slug",
            description: "Slug da usare per il post, attenzione, è consigliato non modificarlo dopo la pubblicazione."
          }
        }),
        link: fields.text({
          label: "Link",
          validation: {
            isRequired: true
          }
        }),
        description: fields.text({
          label: "Description",
          multiline: true,
          validation: {
            isRequired: true
          }
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tag",
          itemLabel: (props) => props.value
        }),
        cover: fields.image({
          label: "Cover Image",
          directory: "src/assets/works",
          publicPath: "@/assets/works/"
        }),
        pubDate: fields.date({
          label: "Publication Date",
          description: "Data di pubblicazione dell'articolo",
          defaultValue: {
            kind: "today"
          },
          validation: {
            isRequired: true
          }
        }),
        lastUpdateDate: fields.date({
          label: "Last Update Date",
          description: "Data dell'ultimo aggiornamento dell'articolo'",
          defaultValue: {
            kind: "today"
          },
          validation: {
            isRequired: true
          }
        }),
        content: fields.markdoc({
          label: "Content",
          options: {
            heading: [2, 3, 4, 5, 6],
            image: {
              directory: "src/assets/posts",
              publicPath: "/src/assets/posts/"
            }
          },
          components: {}
        })
      }
    }),
    authors: collection({
      label: "Authors",
      slugField: "name",
      path: "src/content/authors/*",
      columns: ["name"],
      previewUrl: "/author/{slug}",
      format: { contentField: "content" },
      schema: {
        name: fields.slug({
          name: {
            label: "Name",
            description: "Author's full name",
            validation: {
              isRequired: true
            }
          },
          // Optional slug label overrides
          slug: {
            label: "SEO-friendly slug",
            description: "This will define the file/folder name for this entry"
          }
        }),
        avatar: fields.image({
          label: "Immagine di profilo",
          directory: "src/assets/authors",
          publicPath: "@/assets/authors/"
        }),
        content: fields.document({
          label: "Content",
          formatting: true,
          dividers: true,
          links: true,
          images: {
            directory: "src/assets/authors",
            publicPath: "/src/assets/authors/"
          }
        })
      }
    })
  }
});

const all = makeHandler({ config });
const ALL = all;

const prerender = false;

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  ALL,
  all,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
