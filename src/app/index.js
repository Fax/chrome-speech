function init() {
  console.log('init called');

  var s = window.speechSynthesis;


  var voices = window.speechSynthesis.getVoices();
  var frenchVoice = voices[8]; // Note: some voices don't support altering params


  // Random article from wikipedia
  $('.another').click(function () {
    window.location = window.location;
  });
  var randomUrl = 'https://fr.wikipedia.org/w/api.php?format=json&action=query&generator=random&grnnamespace=0&exlimit=1&prop=extracts|langlinks&grnlimit=1&origin=*';

  $.get(randomUrl, function (response) {
    $('.another').show();
    var article = parseWikipediaResponse(response);

    if (article.langlinks) {
      var englishObject = getEnglishLanguage(article.langlinks);
      console.log('the english object', englishObject);
      if (englishObject) {
        var link = toLink(englishObject);
        retrieveAnotherArticle(link);
      } else {
        $('trans-article').html('This article has not been translated to english yet.');
      }
    } else {
      $('trans-article').html('No other languages found');
    }
    $('title').html(article.title);
    $('.title').html(article.title);
    $('article').html(article.extract);
    var theFirstParagraph = $('article>p:nth(0)');
    var toRead = theFirstParagraph.text();
    theFirstParagraph.css('text-decoration', 'underline');
    var msg = generateMessage(toRead, frenchVoice);

    speechUtteranceChunker(msg, {
      chunkLength: 150
    }, function () {
      //some code to execute when done
      console.log('done');
    });
  });

}

function getEnglishLanguage(languages) {
  var totalLangs = languages.length;
  for (var i = 0; i < totalLangs; i = i + 1) {
    if (languages[i].lang == 'en') {
      return languages[i];
    }
  }
  return null;
}

function retrieveAnotherArticle(articleLink) {
  $.get(articleLink, function (response) {
    var article = parseWikipediaResponse(response);
    $('.trans-title').text(article.title);
    $('trans-article').html(article.extract);
  });
}

function toLink(linkObject) {
  return 'http://en.wikipedia.org/w/api.php?action=query&format=json&exlimit=1&prop=extracts&origin=*&titles=' + linkObject['*'];
}

function parseWikipediaResponse(res) {
  var p = res.query.pages;
  var page = p[Object.keys(p)[0]]
  return page;
}

function generateMessage(text, voice) {
  var msg = new SpeechSynthesisUtterance();

  msg.voice = voice; // Note: some voices don't support altering params
  msg.voiceURI = 'native';
  msg.volume = 1; // 0 to 1
  msg.text = text.trim();
  msg.lang = 'fr-FR';
  return msg;
}

var speechUtteranceChunker = function (utt, settings, callback) {
  settings = settings || {};
  var newUtt;
  var txt = (settings && settings.offset !== undefined ? utt.text.substring(settings.offset) : utt.text).trim();
  txt = txt.replace(/^(\.)/, "");
  if (utt.voice && utt.voice.voiceURI === 'native') { // Not part of the spec
    newUtt = utt;
    newUtt.text = txt;
    newUtt.addEventListener('end', function () {
      if (speechUtteranceChunker.cancel) {
        speechUtteranceChunker.cancel = false;
      }
      if (callback !== undefined) {
        callback();
      }
    });
  } else {
    var chunkLength = (settings && settings.chunkLength) || 160;
    var pattRegex = new RegExp('^[\\s\\S]{' + Math.floor(chunkLength / 2) + ',' + chunkLength + '}[.!?,]{1}|^[\\s\\S]{1,' + chunkLength + '}$|^[\\s\\S]{1,' + chunkLength + '} ');
    var chunkArr = txt.match(pattRegex);

    if (chunkArr[0] === undefined || chunkArr[0].length <= 2) {
      //call once all text has been spoken...
      if (callback !== undefined) {
        callback();
      }
      return;
    }
    var chunk = chunkArr[0];
    newUtt = new SpeechSynthesisUtterance(chunk);
    newUtt.voice = utt.voice;
    newUtt.lang = utt.lang;
    console.log(utt.voice, newUtt.lang);
    var x;
    for (x in utt) {
      if (utt.hasOwnProperty(x) && x !== 'text') {
        newUtt[x] = utt[x];
      }
    }
    newUtt.addEventListener('end', function () {
      if (speechUtteranceChunker.cancel) {
        speechUtteranceChunker.cancel = false;
        return;
      }
      settings.offset = settings.offset || 0;
      settings.offset += chunk.length - 1;
      speechUtteranceChunker(utt, settings, callback);
    });
  }

  if (settings.modifier) {
    settings.modifier(newUtt);
  }
  console.log(newUtt); //IMPORTANT!! Do not remove: Logging the object out fixes some onend firing issues.
  //placing the speak invocation inside a callback fixes ordering and onend issues.
  setTimeout(function () {
    speechSynthesis.speak(newUtt);
  }, 0);
};





window.onload = init;