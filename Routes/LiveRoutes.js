const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const liveControllers = require("../Controllers/LiveControllers");

router.get("/party/:pid/isExisting", liveControllers.isExistingParty);
router.post("/party/create", liveControllers.newparty);
router.post("/party/join", liveControllers.joinParty);
router.post("/party/quit", liveControllers.quitparty);
router.post("/party/begin", liveControllers.beginparty);
router.post("/party/comebacktoparty", liveControllers.comebacktoparty);
router.get("/:uid/isExisting", liveControllers.isExisting);
router.get("/:uid", liveControllers.entry);

module.exports = router;
