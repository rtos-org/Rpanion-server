const express = require("express");
const router = express.Router();
const { validationResult } = require('express-validator')
const ScheduleManager = require('./schedule.js')

// All tasks
router.get("/", (req, res) => {
  ScheduleManager.getAllTasks((stderr, tasksJSON) => {
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify({ error: stderr, taskLists: tasksJSON }));
  });
});

// Add Softether network
router.post(
  "/add",
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      winston.error("Bad POST vars in /api/softetheradd", {
        message: JSON.stringify(errors.array()),
      });
      return res.status(422).json({ error: JSON.stringify(errors.array()) });
    }
    ScheduleManager.addTask(req.body, req.files, (stderr, statusJSON) => {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify({ error: stderr, taskLists: statusJSON }));
    });
  }
);

// Remove 
router.post(
  "/del",
  (req, res) => {
    console.log(req)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      winston.error("Bad POST vars in /api/schedule/del", {
        message: JSON.stringify(errors.array()),
      });
      return res.status(422).json({ error: JSON.stringify(errors.array()) });
    }
    ScheduleManager.delTask(req.body.schedule, (stderr, statusJSON) => {
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify({ error: stderr, taskLists: statusJSON }));
    });
  }
);

module.exports = router
