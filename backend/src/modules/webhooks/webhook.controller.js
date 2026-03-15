// Webhook controller — delegates to messenger.service.js (which contains all the logic)
const messengerService = require('./messenger.service')

module.exports = {
  verifyMessenger: messengerService.verifyMessenger,
  handleMessenger: messengerService.handleMessenger,
  handleN8n: messengerService.handleN8n
}
