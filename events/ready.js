const utils = require('../utils');

module.exports = client => {
client.user.setActivity("", {
  type: "IDLE",
});
    utils.log(`Logado em: ${client.user.tag} !`);

};