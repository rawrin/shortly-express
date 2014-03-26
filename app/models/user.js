var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var bcrypt = Promise.promisifyAll(bcrypt);

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  // defaults: {
  //   visits: 0
  // },
  links: function() {
    return this.hasMany(Link);
  },
  initialize: function() {
    this.on('creating', function(model){
      console.log("event fired");
      var password = model.get('password');
      console.log(model)
      return bcrypt.hashAsync(password, null, null)
        .then(function(hash) {
          model.set('password', hash);
          console.log(model);
          return model;
        })
        .catch(function(err) {
          console.log(err);
        });
    });
  },
  compareHash: function(password) {
    return bcrypt.compareAsync(password, this.get("password"));
  }
});

module.exports = User;