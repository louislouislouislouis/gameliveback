class partyManager {
  constructor() {
    /* On garde une liste de tous les partie connectés */
    this.parties = new Map();
    this.clients = new Map();
  }
  /**
   * Initialise une nouvelle connexion avec un client
   * @function create
   * @param {number|string} idParty - L'identifiant du client
   */
  create(idParty) {
    this.parties.set(idParty, { status: "nonbegin", participants: [] });
  }

  /**
   * Ajoute un joueur à une partie donnée
   * @function addPlayer
   * @param {number|string} idParty - L'identifiant de la partie
   * @param {number|string} PlayerId - L'identifiant du joueur
   */
  addPlayer(idParty, PlayerId) {
    console.log(this.parties.get(idParty));
    let arrayofplayer = this.parties.get(idParty).participants;
    arrayofplayer.push(PlayerId);
    const newobj = { status: "nonbegin", participants: arrayofplayer };
    this.parties.set(idParty, newobj);
    this.clients.set(PlayerId, idParty);
  }

  /**
   * Supprime un joueur à une partie donnée
   * @function removePlayer
   * @param {number|string} idParty - L'identifiant de la partie
   * @param {number|string} PlayerId - L'identifiant du joueur
   */
  removePlayer(idParty, PlayerId) {
    let arrayofplayer = this.parties.get(idParty);
    arrayofplayer.filter((playId) => {
      return playId !== PlayerId;
    });
    this.parties.set(idParty, arrayofplayer);
    this.clients.delete(PlayerId);
  }

  /**
   * Supprime une partie
   * @function delete
   * @param {number|string} idParty - L'identifiant de la partie
   */
  delete(idParty) {
    this.parties.delete(idParty);
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
   * Verifie l'appartenance d'un palyerd'une partie
   * @function checkPartiofPlayer
   * @param {number|string} idPlayer - L'identifiant de la partie
   */
  checkPartiofPlayer(idPlayer) {
    return this.clients.get(idPlayer);
  }
}
module.exports = partyManager;
