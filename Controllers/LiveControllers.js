const HttpError = require("../model/http-err");
const SSEManager = require("../LiveModel/ssemanager");

const sseManager = new SSEManager();

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
const isExisting = async (req, res, next) => {
  console.log("Dans isExisting avec id ", req.params.uid);
  if (sseManager.clients.has(req.params.uid)) {
    const error = new HttpError("Already connected", 403);
    return next(error);
  }
  res.status(201).json({ msg: "Ok" });
};

exports.isExisting = isExisting;

exports.entry = entry;
