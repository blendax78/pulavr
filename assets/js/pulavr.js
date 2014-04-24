var Pulavr = {};

(function() {

// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// Click handlers setup
$(function(){
  $('#personal_id').val(makeid());

  $('#make-call').click(function(event){
    event.preventDefault();
    event.stopPropagation();
    // Initiate a call!
    var call = Pulavr.peer.call($('#callto-id').val(), window.localStream);

    step3(call);
  });

  $('#end-call').click(function(){
    window.existingCall.close();
    step2();
  });

  // Retry if getUserMedia fails
  $('#step1-retry').click(function(){
    $('#step1-error').hide();
    step1();
  });

  // Get things started
  step1();
});

function step1 () {
  // Get audio/audio stream
  navigator.getUserMedia({audio: true, video: false}, function(stream){
    // Set your audio displays
    $('#my-audio').prop('src', URL.createObjectURL(stream));

    window.localStream = stream;
    // step2();
  }, function(){ $('#step1-error').show(); });
}

function step2 () {
  $('#in_call').hide();
  $('#your_id').show();
}

function step3 (call) {
  // Hang up on an existing call if present
  if (window.existingCall) {
    window.existingCall.close();
  }

  // Wait for stream on the call, then set peer audio display
  call.on('stream', function(stream){
    $('#their-audio').prop('src', URL.createObjectURL(stream));
  });

  // UI stuff
  window.existingCall = call;
  $('#their-id').text(call.peer);
  call.on('close', step2);
  $('#allow, #your_id').hide();
  $('#in_call').show();
}

$('#set_id').click(function(e){
  $('#set_id').attr('disabled','disabled');
  $('#personal_id').attr('disabled','disabled');
  
  // PeerJS object
  // Pulavr.peer = new Peer( ($('#personal_id').val().length > 1) ? $('#personal_id').val() : '', { key: 'lwjd5qra8257b9', debug: 3, config: {'iceServers': [
  //   { url: 'stun:stun.l.google.com:19302' }, // Pass in optional STUN and TURN server for maximum network compatibility
  // ]}});
  Pulavr.peer = new Peer( ($('#personal_id').val().length > 1) ? $('#personal_id').val() : '', { host: 'pulavr.vintimilla.org', port: 9000, debug: 3, config: {'iceServers': [
    { url: 'stun:stun.l.google.com:19302' }, // Pass in optional STUN and TURN server for maximum network compatibility
  ]}});

  Pulavr.peer.on('open', function(id){
    $('#my-id').text(id);
    Pulavr.id = id;
  });
  

  // Receiving a call
  Pulavr.peer.on('call', function(call){
    // Answer the call automatically (instead of prompting user) for demo purposes
    console.log('call!',call);
    call.answer(window.localStream);
    step3(call);
  });
  Pulavr.peer.on('error', function(err){
    //http://peerjs.com/docs/#peeron-error
    switch (err.type) {
      case 'browser-incompatible':
        alert(err.message);
        step1();
        return;
      break;
      case 'invalid-key':
        alert('Sorry, an error as occurred');
        console.log(err.message);
      break;
      case 'unavailable-id':
        alert(err.message);
        step1();
        return;
      break;
      case 'server-disconnected':
        alert(err.message);
      break;
      case 'server-error':
        alert(err.message);
      break;
      case 'socket-error':
        alert(err.message);
      break;
      case 'socket-closed':
        alert(err.message);
      break;
    }
    // Return to step 2 if error occurs
    step2();
  });

  $('#allow').hide();
  $('#id_row').hide();
  $('#your_id').show();
});

})();

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
