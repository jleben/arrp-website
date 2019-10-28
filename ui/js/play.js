
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

  var post_url = "http://" + location.hostname + "/compiler";

  var xmlhttp = new XMLHttpRequest();

  //console.log("Posting...\n");

  xmlhttp.responseType = 'json';
  xmlhttp.onreadystatechange = function() {
      //console.log("State change: " + xmlhttp.readyState);
      if (xmlhttp.readyState != 4) {
          return;
      }
      if (xmlhttp.status != 200) {
          var msg = "An error occured with the network request.\n"
                  + "HTTP status = " + xmlhttp.status + ".\n";
                  + xmlhttp.responseText;
          document.getElementById("arrp-output").value = msg;
      }
      else if (xmlhttp.responseType != "json") {
          var msg = "Received unexpected response type: " + xmlhttp.responseType + '\n';
          document.getElementById("arrp-output").value = msg;
      }
      else {
          processArrpResponse(xmlhttp.response);
      }
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
    var arrp_compiler_log = decodeResponse(json.arrp_compiler)
    var cpp_source = decodeResponse(json.cpp)
    var cpp_compiler_log = decodeResponse(json.cpp_compiler_log)
    var program_out = decodeResponse(json.output)

    if (error) {
        var msg = "There was a problem: " + error + '\n';
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
        document.getElementById("arrp-output").value = program_out;
    }
}
