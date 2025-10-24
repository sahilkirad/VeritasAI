const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const next = require("next");

// Set global options for all functions
setGlobalOptions({
  maxInstances: 10,
  region: "asia-south1",
});

// Initialize Next.js app
const nextApp = next({
  dev: false,
  conf: {
    distDir: ".next",
  },
});

const nextjsHandler = nextApp.getRequestHandler();

// Export the Next.js app as a Firebase Function
exports.nextjs = onRequest(
  {
    region: "asia-south1",
    memory: "1GiB",
    timeoutSeconds: 60,
  },
  async (req, res) => {
    return nextjsHandler(req, res);
  }
);
