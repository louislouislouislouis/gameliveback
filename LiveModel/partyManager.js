class partyManager {
  constructor() {
    /* On garde une liste de tous les partie connectés */
    this.parties = new Map();
    this.clients = new Map();
  }

  /**
   * Initialise une nouvelle partie avec un playerMaster
   * @function create
   * @param {number|string} idParty - L'identifiant du client
   * @param {number|string} idPlayer - L'identifiant du client
   */
  create(idParty, idPlayer) {
    this.parties.set(idParty, {
      status: "nonbegin",
      participants: [{ id: idPlayer, status: "connected", role: "master" }],
    });
    this.clients.set(idPlayer, idParty);
    console.log(this.parties);
    console.log(this.clients);
  }

  /**
   * Obtenir les clients connectée à une partie
   * @function getPlayerConnectedinParty
   * @param {number|string} idParty - L'identifiant de la partie
   * @return {[string]} Liste des id client connectées
   */
  getPlayerConnectedinParty(idParty) {
    const playerconnected = this.parties
      .get(idParty)
      .participants.filter((player) => player.status === "connected");
    const playersIdconnected = [];
    playerconnected.forEach((player) => {
      playersIdconnected.push(player.id);
    });
    return playersIdconnected;
  }

  /**
   * Obtenir les toutes les partis
   * @function getAllParties
   * @return {Map} Liste des parties
   */
  getAllParties() {
    return this.parties;
  }

  /**
   * Obtenir les toutes les joueurs
   * @function getAllPlayer
   * @return {Map} Liste des clients
   */
  getAllPlayers() {
    return this.clients;
  }

  /**
   * Savoir l'état d'une party
   * @function getStatusofParty
   * @param {number|string} idParty - L'identifiant de la party
   * @return {String}} Etat de la partie
   */
  getStatusofParty(idParty) {
    return this.parties.get(idParty).status;
  }
  /**
   * Avoir une partie
   * @function getOneParty
   * @param {number|string} idParty - L'identifiant de la party
   * @return {Map}} Party
   */
  getOneParty(idParty) {
    console.log(idParty);
    return this.parties.get(idParty);
  }
  /**
   * Editer une partie
   * @function setOneParty
   * @param {number|string} idParty - L'identifiant de la party
   * @param {Map} party - L'identifiant de la party
   * @return {Map}} Party
   */
  setOneParty(idParty, party) {
    return this.parties.set(idParty, party);
  }

  /**
   * Commancer une partie
   * @function begin
   * @param {number|string} idParty - L'identifiant de la party
   * @return {boolean} if the party has started
   */
  begin(idParty) {
    let myparty = this.parties.get(idParty);
    myparty.participants = myparty.participants.filter(
      (part) => part.status === "connected"
    );
    myparty.status = "begin";

    this.parties.set(idParty, myparty);
    return true;
  }

  /**
   * Ajoute un joueur à une partie donnée
   * @function addPlayer
   * @param {number|string} idParty - L'identifiant de la partie
   * @param {number|string} PlayerId - L'identifiant du joueur
   */
  addPlayer(idParty, PlayerId) {
    let arrayofplayer = this.parties.get(idParty).participants;

    //check if player already been in party
    const indexplayer = arrayofplayer.findIndex(
      (player) => player.id === PlayerId
    );
    if (indexplayer === -1) {
      arrayofplayer.push({ id: PlayerId, status: "connected", role: "slave" });
    } else {
      arrayofplayer[indexplayer] = {
        id: PlayerId,
        status: "connected",
        role: "slave",
      };
    }
    //check if player already been in party
    const newobj = {
      status: this.parties.get(idParty).status,
      participants: arrayofplayer,
    };

    //save data
    this.parties.set(idParty, newobj);
    this.clients.set(PlayerId, idParty);
  }

  /**
   * Supprime un joueur à une partie donnée
   * @function removePlayer
   * @param {number|string} idParty - L'identifiant de la partie
   * @param {number|string} PlayerId - L'identifiant du joueur
   * @return {boolean} - True if la partie existe encore, false sinon
   */
  removePlayer(idParty, PlayerId) {
    let returnvalue = true;

    //on recup la liste de player de la partie
    let arrayofplayer = this.parties.get(idParty);
    //on trouve l'index du player
    let indexoldplayer = arrayofplayer.participants.findIndex(
      (elem) => elem.id === PlayerId && elem.status === "connected"
    );

    //definir new master if needed
    if (arrayofplayer.participants[indexoldplayer].role === "master") {
      const indexnewmaster = arrayofplayer.participants.findIndex(
        (player) => player.status === "connected" && player.role === "slave"
      );
      if (indexnewmaster === -1) {
        this.delete(
          idParty,
          "On supprime la partie car le master est parti et il n'y a pas d'autre joueurs"
        );
        returnvalue = false;
      } else {
        arrayofplayer.participants[indexnewmaster].role = "master";
      }
    }

    //on supprime la partie si il n'y a pas de player connecté
    let indexofplayeralive = arrayofplayer.participants.findIndex(
      (part) => part.status === "connected"
    );
    if (indexofplayeralive === -1) {
      this.delete(
        idParty,
        "on supprime la partie car aucun player n'est connecté"
      );
      returnvalue = false;
    }
    //si il y a encore du monde dans la partie on va changer les statuts
    if (returnvalue === true) {
      //on l'indique comme deconnected
      arrayofplayer.participants[indexoldplayer] = {
        id: PlayerId,
        role: "slave",
        status: "disconnect",
      };
      //on applique les changements
      this.parties.set(idParty, arrayofplayer);
    }

    //on le supprime de la liste des joueurs
    this.clients.delete(PlayerId);
    return returnvalue;
  }

  /**
   * Supprime une partie
   * @function delete
   * @param {number|string} idParty - L'identifiant de la partie
   */
  delete(idParty, message = null) {
    if (message) {
      console.log(message);
    }
    this.parties.delete(idParty);
  }
  /**
   * Supprime un player
   * @function deletePlayer
   * @param {number|string} idPlayer - L'identifiant de la partie
   */
  deletePlayer(idPlayer) {
    this.clients.delete(idPlayer);
  }

  /**
   * Verifie l'existence d'une partie
   * @function checkPartiId
   * @param {number|string} idParty - L'identifiant de la partie
   */
  checkPartiId(idParty) {
    return this.parties.has(idParty);
  }
  /**
   * Verifie l'appartenance d'un player à une partie
   * @function checkPartiofPlayer
   * @param {number|string} idPlayer - L'identifiant de la partie
   */
  checkPartiofPlayer(idClient) {
    return this.clients.get(idClient);
  }

  /**
   * Reconnecte un player à une partie
   * @function checkPartiofPlayer
   * @param {number|string} idPlayer - L'identifiant du joueurs
   * @param {number|string} PlayerId - L'identifiant de la partie
   * @return {boolean} - True if le player à été rajoutée à la partie, faux sinon
   */
  checkpartyrecoming(idParty, PlayerId) {
    //on recup la partie
    let arrayofplayer = this.parties.get(idParty);

    //si la partie existe pas on retourne false
    if (!arrayofplayer) return false;

    //on trouve l'index du joueur dans la liste de participants de la partie
    let index = arrayofplayer.participants.findIndex(
      (elem) => elem.id === PlayerId
    );

    //on retourne faux si jamais ce joueur n'appartient pas à la partie
    if (index === -1) {
      return false;
    }
    console.log(arrayofplayer.participants);

    //on change son statut en connecté
    arrayofplayer.participants[index] = {
      role: arrayofplayer.participants[index].role,
      id: PlayerId,
      status: "connected",
    };

    //on applique nos changements
    this.parties.set(idParty, arrayofplayer);
    this.clients.set(PlayerId, idParty);

    return true;
  }
}
module.exports = partyManager;
