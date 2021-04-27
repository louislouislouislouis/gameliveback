const express = require("express");
const router = express.Router();

const liveControllers = require("../Controllers/LiveControllers");

router.get("/party/:pid/isExisting", liveControllers.isExistingParty);
router.post("/party/create", liveControllers.newparty);
router.post("/party/isPlaying", liveControllers.isplayerinParty);
router.get("/:uid/isExisting", liveControllers.isExisting);
router.get("/:uid", liveControllers.entry);

module.exports = router;
