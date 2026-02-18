import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJET_MODE === "DRY_RUN" ? "DRY_RUN" : "LIVE";
console.log("ARCJET_KEY exists:", !!process.env.ARCJET_KEY);
console.log("ARCJET_MODE:", process.env.ARCJET_MODE);

if (!arcjetKey) throw new Error("ARCJET_KEY environment variable is missing.");

export const httpArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: arcjetMode, interval: "10s", max: 5 }),
      ],
    })
  : null;

export const wsArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: arcjetMode, interval: "2s", max: 5 }),
      ],
    })
  : null;

// export function securityMiddleware() {
//   return async (req, res, next) => {
//     if (!httpArcjet) return next();

//     try {
//       const decision = await httpArcjet.protect(req);

//       if (decision.isDenied()) {
//         if (decision.reason.isRateLimit()) {
//           return res.status(429).json({ error: "Too many requests." });
//         }

//         return res.status(403).json({ error: "Forbidden." });
//       }
//     } catch (e) {
//       console.error("Arcjet middleware error", e);
//       return res.status(503).json({ error: "Service Unavailable" });
//     }

//     next();
//   };
// }
export function securityMiddleware() {
  return async (req, res, next) => {
    console.log("Arcjet middleware running");

    if (!httpArcjet) {
      console.log("Arcjet NOT initialized");
      return next();
    }

    try {
      const decision = await httpArcjet.protect(req);
      console.log("Arcjet decision:", decision);

      if (decision.isDenied()) {
        console.log("Denied");
        return res.status(429).json({ error: "Too many requests" });
      }

      if (decision.isAllowed()) {
        console.log("Allowed");
        return next();
      }

      return res.status(403).json({ error: "Forbidden" });
    } catch (err) {
      console.error("Arcjet error:", err);
      return res.status(503).json({ error: "Service Unavailable" });
    }
  };
}
