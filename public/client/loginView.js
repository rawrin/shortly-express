Shortly.loginView = Backbone.View.extend({
  className: 'creator',

  template: Templates['login'],

  events: {
    'submit': 'login'
  },

  render: function() {
    this.$el.html( this.template() );
    return this;
  },

  login: function(e) {
    e && e.preventDefault();
    var username = this.$el.find('input#username').val();
    var password = this.$el.find('input#password').val();
    var that = this;
    $.post('/login', {
      username: username,
      password: password,
      json: true
    }, function(res){
      if(!!res.success){
        shortly.router.isLoggedIn = true;
        shortly.router.navigate('/', {trigger: true});
      } else {
        window.alert("Wrong username/password");
        that.$el.find('input#password').val("");
      }
    });
    // e.preventDefault();
    // var $form = this.$el.find('form .text');
    // var link = new Shortly.Link({ url: $form.val() })
    // link.on('request', this.startSpinner, this);
    // link.on('sync', this.success, this);
    // link.on('error', this.failure, this);
    // link.save({});
    // $form.val('');
  },

  startSpinner: function() {
    this.$el.find('img').show();
    this.$el.find('form input[type=submit]').attr('disabled', 'true');
    this.$el.find('.message')
      .html('')
      .removeClass('error');
  },

  stopSpinner: function() {
    this.$el.find('img').fadeOut('fast');
    this.$el.find('form input[type=submit]').attr('disabled', null);
    this.$el.find('.message')
      .html('')
      .removeClass('error');
  }
});
