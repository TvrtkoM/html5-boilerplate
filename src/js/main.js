var $ = require('jquery'),
  Vue = require('vue'),
  ac_timeout
  ;

var search_titles = function(what) {
  return $.ajax({
    type: 'get',
    url: '//en.wikipedia.org/w/api.php?formatversion=2&format=json',
    jsonp: 'callback',
    dataType: 'jsonp',
    data: {
      action: 'query',
      generator: 'search',
      gsrsearch: what
    }
  });
};

var search_wikies = function(what) {
  return $.ajax({
    type: 'get',
    url: '//en.wikipedia.org/w/api.php?formatversion=2&format=json',
    jsonp: 'callback',
    dataType: 'jsonp',
    data: {
      action: 'query',
      generator: 'search',
      prop: 'extracts',
      exlimit: 'max',
      explaintext: '',
      exintro: '',
      gsrsearch: what
    }
  })
};

var search_dd = new Vue({
  el: '#app',
  data: {
    query_str: '',
    ac_list: [],
    results: []
  },
  methods: {
    autocomplete: function(event) {
      var _this = this;
      if(ac_timeout) {
        clearTimeout(ac_timeout);
      }
      ac_timeout = setTimeout(function() {
        search_titles(_this.query_str).done(function(data) {
          _this.ac_list = data.query.pages;
        });
      }, 300);
    },
    use_for_query: function(event) {
      this.query_str = $(event.target).text();
      this.ac_list = [];
    },
    search: function(events) {
      var _this = this;
      events.preventDefault();
      search_wikies(this.query_str).done(function(data) {
        _this.results = data.query.pages;
      });
    }
  }
});

