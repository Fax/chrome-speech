function init() {
  console.log('init called');

  var s = window.speechSynthesis;


  var voices = window.speechSynthesis.getVoices();
  var frenchVoice = voices[8]; // Note: some voices don't support altering params


    // Random article from wikipedia
  
  var randomUrl = 'https://fr.wikipedia.org/w/api.php?format=json&action=query&generator=random&grnnamespace=0&prop=extracts&grnlimit=1';

  $.get(randomUrl, function (response) {
    console.log(response.query.pages);
   // $('article').html()
    // var msg = generateMessage('Bonjour!', frenchVoice);
    // s.speak(msg);
  });

}

function generateMessage(text, voice) {
  var msg = new SpeechSynthesisUtterance();

  msg.voice = voice; // Note: some voices don't support altering params
  msg.voiceURI = 'native';
  msg.volume = 1; // 0 to 1
  msg.text = text;
  msg.lang = 'fr-FR';
  return msg;
}







window.onload = init;