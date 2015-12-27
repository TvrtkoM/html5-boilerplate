var Vue = require('vue');
var jQuery = require('jquery');

(function($) {
  var items = [],
    unavailable = [];

  var get_twitch = function(name) {
    var request = $.ajax({
      url: 'https://api.twitch.tv/kraken/channels/' + name + '?callback=',
      method: 'get',
      type: 'json',
      success: function(data) {
        console.log(data);
      }
    }), chained = request.pipe(function(channel) {
      if(channel.status !== 422) {
        return $.ajax({
          url: 'https://api.twitch.tv/kraken/streams/' + name,
          method: 'get',
          type: 'json',
          success: function (data) {
            if (data.stream) {
              channel.stream = true;
            }
            items.push(channel);
          }
        });
      }
      unavailable.push(name);
      return request;
    });
    return chained;
  };

  var ajax_load = (function(channels) {
    var deferres = [];
    $.each(channels, function(idx, val) {
      deferres.push(get_twitch(val));
    });
    return $.when.apply($, deferres);
  }(['freecodecamp', 'tsm_theoddone', 'massansc', 'nightblue3', 'admiralbulldog', 'rocketbeanstv', 'brunofin', 'comster404']));

  var app = new Vue({
    el: '#app',
    data: {
      items: [],
      unavailable: null
    }
  });

  ajax_load.done(function() {
    app.items = items;
    app.unavailable = unavailable;
  });
}(jQuery));
