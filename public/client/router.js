Shortly.Router = Backbone.Router.extend({
  initialize: function(options){
    this.$el = options.el;
    var that = this;

    $.get('/isLoggedIn', function(res){
      that.isLoggedIn = res.success;
    });
  },

  isLoggedIn: false,

  routes: {
    '':       'index',
    'create': 'create',
    'login': 'login',
    'signup': 'signup'
  },

  swapView: function(view){
    this.$el.html(view.render().el);
  },

  signin: function(){
    this.isLoggedIn = true;
  },

  index: function(){
    if(!this.isLoggedIn){
      return this.navigate('/login', {trigger: true});
    }
    var links = new Shortly.Links();
    var linksView = new Shortly.LinksView({ collection: links });
    this.swapView(linksView);
  },

  create: function(){
    if(!this.isLoggedIn){
      return this.navigate('/login', {trigger: true});
    }
    this.swapView(new Shortly.createLinkView());
  },

  login: function(){
    if(!!this.isLoggedIn){
      return this.navigate('/', {trigger: true});
    }
    this.swapView(new Shortly.loginView());
  },

  signup: function(){
    this.swapView(new Shortly.signUpView());
  }

});
