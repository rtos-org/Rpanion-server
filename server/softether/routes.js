const express = require("express");
const router = express.Router();
const { validationResult } = require('express-validator')
const VPNManager = require('./vpn.js')

// Serve the vpn Softether info
router.get("/", (req, res) => {
  VPNManager.getVPNStatusSoftether(null, (stderr, statusJSON) => {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ error: stderr, statusSoftether: statusJSON }));
  });
});

// Add Softether network
router.post(
  "/add",
  (req, res) => {
    const errors = validationResult(req);
    console.log(req.body)
    if (!errors.isEmpty()) {
      winston.error("Bad POST vars in /api/softetheradd", {
        message: JSON.stringify(errors.array()),
      });
      return res.status(422).json({ error: JSON.stringify(errors.array()) });
    }
    VPNManager.addSoftether(req.body.network, (stderr, statusJSON) => {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify({ error: stderr, statusSoftether: statusJSON }));
    });
  }
);

// Remove Softether network
router.post(
  "/del",
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      winston.error("Bad POST vars in /api/softetherdel", {
        message: JSON.stringify(errors.array()),
      });
      return res.status(422).json({ error: JSON.stringify(errors.array()) });
    }
    VPNManager.removeSoftether(req.body.network, (stderr, statusJSON) => {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify({ error: stderr, statusSoftether: statusJSON }));
    });
  }
);

// activate Softether network
router.post(
  "/activate",
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
      res.send(JSON.stringify({ error: stderr, statusSoftether: statusJSON }));
    });
  }
);

// deactivate Softether network
router.post(
  "/deactivate",
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
      res.send(JSON.stringify({ error: stderr, statusSoftether: statusJSON }));
    });
  }
);

module.exports = router
