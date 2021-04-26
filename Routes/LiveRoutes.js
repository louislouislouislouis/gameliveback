const express = require("express");
const router = express.Router();

const liveControllers = require("../Controllers/LiveControllers");

router.get("/:uid/isExisting", liveControllers.isExisting);
router.get("/:uid", liveControllers.entry);
module.exports = router;
