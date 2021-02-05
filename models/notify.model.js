const mongoose = require('mongoose');

const NotifySchema = mongoose.Schema({
    notify: Number
});

module.exports = mongoose.model('notify', NotifySchema);