
window.onload = function() {
    setRandomInput();
};

function setRandomInput() {
    var input = "";
    var i;
    for (i = 0; i < 10; i++) {
        input += (Math.floor(Math.random() * 100) / 10).toString() + '\n';
    }
    document.getElementById("arrp-input").value = input;
}

function sendArrpInput() {

  var code = document.getElementById("arrp-code").value;
  var input = document.getElementById("arrp-input").value;

  var data = {
      "code": code,
      "input": input
  };

  var dataBlob = new Blob([JSON.stringify(data)], {type: 'application/json'});

  var post_url = "http://" + location.host + "/compiler";

  var xmlhttp = new XMLHttpRequest();

  var startTime = 0;
  if (window.performance) {
    startTime = performance.now();
  }
  //console.log("Posting...\n");

  xmlhttp.responseType = 'json';
  xmlhttp.onreadystatechange = function() {
      //console.log("State change: " + xmlhttp.readyState);
      if (xmlhttp.readyState != 4) {
          return;
      }

      var duration = 0;
      if (window.performance) {
        duration = performance.now() - startTime;
      }

      event_name = 'run';

      if (xmlhttp.status != 200) {
          var msg = "An error occured with the network request.\n"
                  + "HTTP status = " + xmlhttp.status + ".\n";
          if (xmlhttp.response)
              msg += xmlhttp.response;
          document.getElementById("arrp-output").value = msg;
          event_name = 'run-error-http';
      }
      else if (xmlhttp.responseType != "json") {
          var msg = "Received unexpected response type: " + xmlhttp.responseType + '\n';
          document.getElementById("arrp-output").value = msg;
          event_name = 'run-error-response-type';
      }
      else {
          processArrpResponse(xmlhttp.response);
          if (xmlhttp.response.error) {
            event_name = 'run-error';
          } else {
            event_name = 'run-successful';
          }
      }

      gtag('event', event_name, {
        'event_category' : 'Playground',
        'value': duration,
      });

      // Send timing
      gtag('event', 'timing_complete', {
        'name' : event_name,
        'value' : duration,
        'event_category' : 'Playground'
      });
  };
  xmlhttp.open("POST", post_url, true);
  xmlhttp.send(dataBlob);
  document.getElementById("arrp-output").value = "Waiting for response...";
}

function decodeResponse(field) {
    if (field)
        return atob(field)
    else
        return null;
}

function processArrpResponse(json) {
    var error = json.error
    var arrp_version = decodeResponse(json.arrp_version)
    var arrp_compiler_log = decodeResponse(json.arrp_compiler)
    var cpp_source = decodeResponse(json.cpp)
    var cpp_compiler_log = decodeResponse(json.cpp_compiler_log)
    var program_out = decodeResponse(json.output)

    if (error) {
        var msg = "There was a problem: " + error + '\n';
        if (arrp_version && arrp_version.length) {
          msg += '\n' + arrp_version.trim() + '\n'
        }
        if (arrp_compiler_log) {
            msg += "\nArrp compiler output: \n";
            msg += arrp_compiler_log;
            msg += '\n'
        }
        if (cpp_compiler_log) {
            msg += "\nC++ compiler output: \n";
            msg += cpp_compiler_log;
            msg += '\n'
        }
        document.getElementById("arrp-output").value = msg;
    }
    else
    {
        let text = ""
        if (arrp_version && arrp_version.length) {
          text += arrp_version.trim() + '\n\n'
        }
        text += program_out;
        document.getElementById("arrp-output").value = text;
    }
}
