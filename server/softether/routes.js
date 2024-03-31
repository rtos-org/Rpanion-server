const VPNManager = require('./vpn')

module.exports = function (app) {
  // Serve the vpn Softether info
  app.get("/api/softether", (req, res) => {
    VPNManager.getVPNStatusSoftether(null, (stderr, statusJSON) => {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify({ error: stderr, statusSofteher: statusJSON }));
    });
  });

  // Add Softether network
  app.post(
    "/api/softetheradd",
    [check("network").isAlphanumeric()],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        winston.error("Bad POST vars in /api/softetheradd", {
          message: JSON.stringify(errors.array()),
        });
        return res.status(422).json({ error: JSON.stringify(errors.array()) });
      }
      VPNManager.addZerotier(req.body.network, (stderr, statusJSON) => {
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({ error: stderr, statusZerotier: statusJSON }));
      });
    }
  );

  // Remove Softether network
  app.post(
    "/api/softetherdel",
    [check("network").isAlphanumeric()],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        winston.error("Bad POST vars in /api/softetherdel", {
          message: JSON.stringify(errors.array()),
        });
        return res.status(422).json({ error: JSON.stringify(errors.array()) });
      }
      VPNManager.removeZerotier(req.body.network, (stderr, statusJSON) => {
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({ error: stderr, statusZerotier: statusJSON }));
      });
    }
  );

  // activate Softether network
  app.post(
    "/api/vpnsoftetheractivate",
    [check("network").isAlphanumeric()],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        winston.error("Bad POST vars in /api/vpnsoftetheractivate", {
          message: JSON.stringify(errors.array()),
        });
        return res.status(422).json({ error: JSON.stringify(errors.array()) });
      }
      VPNManager.removeZerotier(req.body.network, (stderr, statusJSON) => {
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({ error: stderr, statusZerotier: statusJSON }));
      });
    }
  );

  // deactivate Softether network
  app.post(
    "/api/vpnsoftetherdeactivate",
    [check("network").isAlphanumeric()],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        winston.error("Bad POST vars in /api/vpnsoftetherdeactivate", {
          message: JSON.stringify(errors.array()),
        });
        return res.status(422).json({ error: JSON.stringify(errors.array()) });
      }
      VPNManager.removeZerotier(req.body.network, (stderr, statusJSON) => {
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({ error: stderr, statusZerotier: statusJSON }));
      });
    }
  );
};
