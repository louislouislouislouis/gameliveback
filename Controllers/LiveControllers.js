const HttpError = require("../model/http-err");
const SSEManager = require("../LiveModel/ssemanager");
const partyManager = require("../LiveModel/partyManager");

const sseManager = new SSEManager();
const mypartyManager = new partyManager();

const entry = async (req, res, next) => {
  console.log("Dans entry avec id", req.params.uid);
  const id = req.params.uid;

  if (sseManager.clients.has(id)) {
    const error = new HttpError("Already connected", 403);
    return next(error);
  }
  // On ouvre la connexion avec notre client //
  sseManager.open(id, res);

  // On envoie le nombre de clients connectés à l'ensemble des clients //
  sseManager.broadcast({
    id: Date.now(),
    type: "count",
    data: sseManager.count(),
  });

  // en cas de fermeture de la connexion, on supprime le client de notre manager //
  req.on("close", () => {
    console.log(`Il a quitté le batard ${id}`);
    // En cas de deconnexion on supprime le client de notre manager //
    sseManager.delete(id);
    // On envoie le nouveau nombre de clients connectés //
    sseManager.broadcast({
      id: Date.now(),
      type: "count",
      data: sseManager.count(),
    });
  });
};
const newparty = async (req, res, next) => {
  console.log("Dans newparty avec id", req.body.idParty);
  const { idParty, idPlayer } = req.body;
  if (mypartyManager.checkPartiId(idParty)) {
    const error = new HttpError(
      "There is already a party with this id sorry",
      403
    );
    return next(error);
  }
  mypartyManager.create(idParty);
  mypartyManager.addPlayer(idParty, idPlayer);
  res.status(201).json({ msg: "Ok" });
};

const isExisting = async (req, res, next) => {
  console.log("Dans isExisting avec id ", req.params.uid);
  if (sseManager.clients.has(req.params.uid)) {
    const error = new HttpError("Already connected", 403);
    return next(error);
  }
  res.status(201).json({ msg: "Ok" });
};
const isExistingParty = async (req, res, next) => {
  console.log("Dans isExistingParty avec id ", req.params.pid);
  if (mypartyManager.checkPartiId(req.params.pid)) {
    const error = new HttpError("Already connected", 403);
    return next(error);
  }
  res.status(201).json({ msg: "Ok" });
};
const isplayerinParty = async (req, res, next) => {
  console.log("Dans isplayerinParty avec id ", req.body.playerId);
  const { playerId } = req.body;
  const partyId = mypartyManager.checkPartiofPlayer(playerId);
  if (partyId) {
    res.status(201).json({ partyId: partyId });
  } else {
    res.status(201).json({ partyId: false });
  }
};
exports.isExisting = isExisting;
exports.isExistingParty = isExistingParty;
exports.newparty = newparty;
exports.entry = entry;
exports.isplayerinParty = isplayerinParty;
