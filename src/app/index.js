function init () {
  console.log('init called');

  var s = window.speechSynthesis;



  var msg = new SpeechSynthesisUtterance();
  var voices = window.speechSynthesis.getVoices();
  msg.voice = voices[8]; // Note: some voices don't support altering params
  msg.voiceURI = 'native';
  msg.volume = 1; // 0 to 1
  msg.text = 'Bonjour Laure. Avez-vous des nouvelles sur l\'appartement?';
  msg.lang = 'fr-FR';
  
  msg.onend = function(e) {
    console.log('Finished in ' + event.elapsedTime + ' seconds.');
  };
  
  s.speak(msg);
}



window.onload = init;