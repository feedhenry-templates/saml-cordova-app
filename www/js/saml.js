var $ = require("jquery");

$(document).ready(function() {

  function updateDetails(details) {
    $('.first_name').text(details.first_name);
    $('.last_name').text(details.last_name);
    $('.email').text(details.email);
    $('.expires').text(details.expires);
  }

  function showSignedIn() {
    $('.signed-in').show();
    $('.sign-in').hide();

    $fh.cloud({
        path: 'sso/session/valid',
        method: "POST",
        data: {
          "token": $fh._getDeviceId()
        }
      },
      function(res) {
        updateDetails(res);
      },
      function(code, errorprops, params) {
        console.error(code, errorprops, params);
        alert('An error occured: ' + code + ' : ' + errorprops);
      }
    );
  }

  $('.sign-in-button').on('click', function(e) {
    $fh.cloud({
        path: 'sso/session/login_host',
        method: "POST",
        data: {
          "token": $fh._getDeviceId()
        }
      },
      function(res) {
        console.log('sso host:' + res.sso);

        var browser = cordova.InAppBrowser.open(res.sso, '_blank', 'location=yes');

        browser.addEventListener('loadstop', function(event) {
          // Lets inject some CSS to apply a "Mobile" style to this IdP login page
          browser.insertCSS({
            code: 'body { background: #fff !important; font-size: 18px; } input { font-size: 18px; }'
          }, function injected() {
            console.log('injection done!', arguments);
          });

          if (event.url.indexOf('/login/ok') > -1) { // User now logged in!
            showSignedIn();
            browser.close();
            setTimeout(function() {
              navigator.notification.alert(
                "Great, you're signed in!",
                null,
                'SSO',
                'OK'
              );
            }, 500);
          }
          console.error('stop: ' + event.url);
        });
        browser.addEventListener('loaderror', function(event) {
          browser.close();
          setTimeout(function() {
            navigator.notification.alert(
              'Error displaying SSO login page, please try again',
              null,
              'SSO',
              'OK'
            );
          }, 500);

          console.error('error: ' + event.message);
        });
        browser.addEventListener('exit', function(event) {
          console.error(event.type);
        });
      },
      function(code, errorprops, params) {
        console.error(code, errorprops, params);
        alert('An error occured: ' + code + ' : ' + errorprops);
      }
    );
  });

});