const { validationResult } = require("express-validator");

const HttpError = require("../model/http-err");
const SSEManager = require("../LiveModel/ssemanager");
const partyManager = require("../LiveModel/partyManager");

const sseManager = new SSEManager();
const mypartyManager = new partyManager();

/**
 * Entrypointtologin
 * @function entry
 */
const entry = async (req, res, next) => {
  console.log("Dans entry avec id", req.params.uid);
  //validation de la demande en entrée
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Error input", 422));
  }

  //get data from request
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
  //Say thet he is in
  sseManager.unicast(id, {
    id: Date.now(),
    type: "ready",
    data: "ready",
  });

  // en cas de fermeture de la connexion, on supprime le client de notre manager //
  req.on("close", () => {
    console.log(`Il a quitté le batard ${id}`);

    //On le supprime de la liste des players en live
    sseManager.delete(id);

    //on check si il avait une partoe
    const partyid = mypartyManager.checkPartiofPlayer(id);

    //on supprime ce player dans sa partie
    if (partyid) {
      //on le supprime du partyManager
      const avertother = mypartyManager.removePlayer(partyid, id);

      //on avertie les autres uniquement si la partie existe encore
      if (avertother) {
        console.log("J'avertis les autres joueurs que qq est partie");
        //Get array of playerId currently connected to the party
        const playersIdconnected =
          mypartyManager.getPlayerConnectedinParty(partyid);
        //Say to people from party that there is a player gone
        sseManager.multicast(playersIdconnected, {
          id: Date.now(),
          type: "partydata",
          data: { party: mypartyManager.getOneParty(partyid) },
        });
      }
    }
    //logger
    console.log("La liste des party");
    console.log(mypartyManager.getAllParties());
    console.log("La liste des player");
    console.log(mypartyManager.getAllPlayers());
    // On envoie le nouveau nombre de clients connectés //
    sseManager.broadcast({
      id: Date.now(),
      type: "count",
      data: sseManager.count(),
    });
  });
};

/**
 * Create a new party
 * @function newparty
 */
const newparty = async (req, res, next) => {
  console.log("Dans newparty avec id", req.body.idParty);

  //getdata
  const { idParty, idPlayer } = req.body;

  //check idparty
  if (mypartyManager.checkPartiId(idParty)) {
    const error = new HttpError(
      "There is already a party with this id sorry",
      403
    );
    return next(error);
  }

  //createthe party and add player as master
  mypartyManager.create(idParty, idPlayer);

  //logger
  console.log("La liste des party");
  console.log(mypartyManager.getAllParties());
  console.log("La liste des player");
  console.log(mypartyManager.getAllPlayers());

  //Say to him that he his the first
  sseManager.unicast(idPlayer, {
    id: Date.now(),
    type: "partydata",
    data: { party: mypartyManager.getOneParty(idParty) },
  });

  //reponse
  res.status(201).json({ msg: "Ok" });
};

/**
 * Join a party
 * @function joinParty
 */
const joinParty = async (req, res, next) => {
  //log départ
  console.log("Dans joinParty avec id", req.body.idParty);

  //get data from request
  const { idParty, idPlayer } = req.body;

  //Check if party exists and not begin
  if (
    !mypartyManager.checkPartiId(idParty) ||
    mypartyManager.getStatusofParty(idParty) !== "nonbegin"
  ) {
    const error = new HttpError(
      "This id party does not correspond to a non-begin party",
      403
    );
    return next(error);
  }

  //add player to parti
  mypartyManager.addPlayer(idParty, idPlayer);

  //Get array of playerId currently connected to the party
  const playersIdconnected = mypartyManager.getPlayerConnectedinParty(idParty);

  //Say to people from party that there is a new
  sseManager.multicast(playersIdconnected, {
    id: Date.now(),
    type: "partydata",
    data: { party: mypartyManager.getOneParty(idParty) },
  });

  //logger
  console.log("La liste des party");
  console.log(mypartyManager.getAllParties());
  console.log("La liste des player");
  console.log(mypartyManager.getAllPlayers());

  //reponses
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
    //si la partie a commencé on refuse l'accès
    if (mypartyManager.getStatusofParty(req.params.pid) !== "nonbegin") {
      const error = new HttpError("This party already begin", 403);
      return next(error);
    } else {
      const error = new HttpError("This party is existing", 403);
      return next(error);
    }
  }
  res.status(201).json({ msg: "Ok" });
};

/**
 * Revenir automatiquement à une partie quand on s'est déconnecté
 * @function comebacktoparty
 */
const comebacktoparty = async (req, res, next) => {
  console.log("Dans comebacktoparty avec pour l'id ", req.body.PartyId);

  //get data from request
  const { PartyId, PlayerId } = req.body;

  //Se reconnecter
  const partyId = mypartyManager.checkpartyrecoming(PartyId, PlayerId);

  //Envoyer nouvelle liste des players si ajout
  if (partyId) {
    const playersIdconnected =
      mypartyManager.getPlayerConnectedinParty(PartyId);
    sseManager.multicast(playersIdconnected, {
      id: Date.now(),
      type: "partydata",
      data: { party: mypartyManager.getOneParty(PartyId) },
    });
  }

  //Logger
  console.log("La liste des party");
  console.log(mypartyManager.getAllParties());
  console.log("La liste des player");
  console.log(mypartyManager.getAllPlayers());

  //reponse
  res.status(201).json({ partyId: partyId });
};
/**
 * Commencer une partie déja enregistrée
 * @function beginparty
 */
const beginparty = async (req, res, next) => {
  console.log("Dans beginparty avec  l'id ", req.body.idPlayer);

  //return
  let success = false;
  //get data from request
  const { idParty, idPlayer } = req.body;
  const myparty = mypartyManager.getOneParty(idParty);

  //check party exist
  if (!myparty) {
    const error = new HttpError("This party does not exist", 403);
    return next(error);
  } else {
    //check the demandeur is the master
    const indexmaster = myparty.participants.findIndex(
      (part) => part.id === idPlayer && part.role === "master"
    );
    if (indexmaster === -1) {
      const error = new HttpError("Only the master can start a party", 403);
      return next(error);
    } else {
      success = mypartyManager.begin(idParty);
    }
  }
  //if sucess let's avert otherplayer
  if (success) {
    //Get array of playerId currently connected to the party
    const playersIdconnected =
      mypartyManager.getPlayerConnectedinParty(idParty);

    //Say to people that the party is beggining
    sseManager.multicast(playersIdconnected, {
      id: Date.now(),
      type: "partydata",
      data: { party: myparty },
    });
  }

  res.status(201).json({ msg: success, partyId: idParty });
};

/**
 * Quitter volontairement une party
 * @function quitparty
 */
const quitparty = async (req, res, next) => {
  console.log("Dans quitparty avec  l'id ", req.body.idPlayer);
  //get data from request
  const { idParty, idPlayer } = req.body;
  const myparty = mypartyManager.getOneParty(idParty);
  if (idParty) {
    //verif valid data
    if (!myparty) {
      const error = new HttpError("Ther is no party with that id", 403);
      return next(error);
    }
    if (myparty.participants.findIndex((part) => part.id === idPlayer) === -1) {
      const error = new HttpError(
        "Ther player with this id in this party",
        403
      );
      return next(error);
    }

    //remove the player
    const newparts = myparty.participants.filter(
      (part) => part.id !== idPlayer
    );
    myparty.participants = newparts;

    //save change
    mypartyManager.setOneParty(idParty, myparty);

    //avertir les autres qu'un connard est party
    const playersIdconnected = [];
    newparts.forEach((player) => {
      playersIdconnected.push(player.id);
    });
    sseManager.multicast(playersIdconnected, {
      id: Date.now(),
      type: "partydata",
      data: {
        party: myparty,
        message: `le connard ${idPlayer} a quitté la partie en connaissance de cause`,
      },
    });
    mypartyManager.deletePlayer(idPlayer);
  }
  res.status(201).json({ msg: "ok" });
};
exports.isExisting = isExisting;
exports.isExistingParty = isExistingParty;
exports.newparty = newparty;
exports.entry = entry;
exports.comebacktoparty = comebacktoparty;
exports.joinParty = joinParty;
exports.beginparty = beginparty;
exports.quitparty = quitparty;
