var $ = require('jquery');
var Vue = require('vue');

var news_load = $.getJSON('http://www.freecodecamp.com/news/hot');

var stories = new Vue({
  el: '#app',
  data: {
    stories: null
  }
});

Vue.filter('shorten', function(s) {
  if(s.length > 35) {
    return s.slice(0, 32).concat('...');
  }
  return s;
});

Vue.filter('num', function(arr) {
  return arr.length;
});

Vue.filter('from_ts', function(ts) {
  var date = new Date(ts);
  return date.getDate() + '.' + date.getMonth() + '.' + date.getFullYear();
});

news_load.done(function(data) {
  stories.stories = data;
});

