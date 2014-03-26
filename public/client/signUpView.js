Shortly.signUpView = Backbone.View.extend({
  className: 'creator',

  template: Templates['signup'],

  events: {
    'submit': 'signup'
  },

  render: function() {
    this.$el.html( this.template() );
    return this;
  },

  signup: function(e) {
    // e.preventDefault();
    // var $form = this.$el.find('form .text');
    // var link = new Shortly.Link({ url: $form.val() })
    // link.on('request', this.startSpinner, this);
    // link.on('sync', this.success, this);
    // link.on('error', this.failure, this);
    // link.save({});
    // $form.val('');
  },

  success: function(link) {

  },

  failure: function(model, res) {

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
