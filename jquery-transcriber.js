/**
 * Created by chris on 27.04.2017.
 */


function formatSecondsAsTime(secs, format) {
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600)) / 60);
    var sec = Math.floor(secs - (hr * 3600) - (min * 60));

    if (hr < 10) {
        hr = "0" + hr;
    }
    if (min < 10) {
        min = "0" + min;
    }
    if (sec < 10) {
        sec = "0" + sec;
    }
    if (hr) {
        hr = "00";
    }

    if (format != null) {
        var formatted_time = format.replace('hh', hr);
        formatted_time = formatted_time.replace('h', hr * 1 + ""); // check for single hour formatting
        formatted_time = formatted_time.replace('mm', min);
        formatted_time = formatted_time.replace('m', min * 1 + ""); // check for single minute formatting
        formatted_time = formatted_time.replace('ss', sec);
        formatted_time = formatted_time.replace('s', sec * 1 + ""); // check for single second formatting
        return formatted_time;
    } else {
        return hr + ':' + min + ':' + sec;
    }
}

function playAudio(audio, signum) {
    signum.removeClass('fa-play').addClass('fa-pause').removeClass('btn-info').addClass('btn-success');
    audio.play();
}

function pauseAudio(audio, signum) {
    signum.removeClass('fa-pause').addClass('fa-play').removeClass('btn-success').addClass('btn-info');
    audio.pause();
}

function rewindAudio(audio, interval) {
    if (interval > 0) interval = -interval;
    if (audio.currentTime > interval) {
        audio.currentTime += interval;
    } else {
        audio.currentTime = 0;
    }
}

function forwardAudio(audio, interval) {
    if (interval < 0) interval = -interval;
    if (audio.currentTime < (audio.duration - interval)) {
        audio.currentTime += interval;
    } else {
        audio.currentTime = audio.duration;
    }
}

function repositionAudio(audio, interval) {
    if (interval < 0) {
        rewindAudio(audio, interval);
    } else {
        forwardAudio(audio, interval);
    }
}

function addPositionButton(audioId, interval, title) {
    var o = '<button class="btn btn-default" onclick="repositionAudio(document.getElementById(\'' + audioId + '\'), ' + interval.toString() + ')">';
    if (interval < 0) {
        o += '<span class="fa fa-backward"></span> ';
    }
    o += title;
    if (interval > 0) {
        o += ' <span class="fa fa-forward"></span>';
    }
    o += '</button>';
    return $(o);
}


function insertAudioLink(editor, audioElement, brTag) {
    if (brTag) editor.insertHtml('<br />');
    editor.insertHtml('<a class="linkToAudioPosition" href="#audioPos-' + audioElement[0].currentTime + '">[' + formatSecondsAsTime(audioElement[0].currentTime) + ']</a> ');

}

function toggleAudio(playButton, playStatusIndicator, timer, allowAutoPlay) {
    var audio = $('#' + $(playButton).data('audioId'))[0];
    if (playStatusIndicator.hasClass('fa-play')) {
        playAudio(audio, playStatusIndicator);
        return true;
    } else {
        pauseAudio(audio, playStatusIndicator);
        if (timer) clearTimeout(timer);
        return allowAutoPlay;
    }
}

(function ($) {

    $.fn.transcribe = function (userConfig) {
        var defaultConfig = {
            audioElementId: 'audio',
            playButtonId: 'playButton',
            repeatInterval: 1,
            waitInterval: 200,
        };

        var allowAutoPlay = false;

        // create config with possible defaults
        var config = $.extend({}, defaultConfig, userConfig || {});


        var timeOutId = 0;

        var textAreaElement = this;
        // has an id?
        var textAreaId = $(this).attr('id');
        if (textAreaId == '') {
            textAreaId = 'transcriber_textarea_id';
            $(this).attr('id', textAreaId);
        }
        textAreaElement.ckeditor({startupFocus: true});

        var editor = CKEDITOR.instances[textAreaId];


        var container = $(this).parent();

        // add audio element
        var audioFile = $(this).data('audio');
        var audioContainer = $('<div class="form-group"></div>').insertAfter(container);
        var audioElement = $('<audio src="' + audioFile + '" id="' + config.audioElementId + '" ontimeupdate="document.getElementById(\'tracktime\').innerHTML = formatSecondsAsTime(Math.floor(this.currentTime)) + \' / \' + formatSecondsAsTime(Math.floor(this.duration))+ \'\';"></audio>').appendTo(audioContainer);

        // add buttons
        var buttonContainer = $('<div class="form-group"></div>').insertAfter(audioContainer);

        addPositionButton(config.audioElementId, -60, '-1m').appendTo(buttonContainer);
        addPositionButton(config.audioElementId, -10, '-10s').appendTo(buttonContainer);
        addPositionButton(config.audioElementId, -5, '-5s').appendTo(buttonContainer);
        addPositionButton(config.audioElementId, -1, '-1s').appendTo(buttonContainer);
        var playButton = $('<button class="btn btn-success ' + config.playButtonClass + ' button-play" id="' + config.playButtonId + '"><span class="fa fa-play"></button> ').appendTo(buttonContainer);
        var playStatusIndicator = playButton.find('span').first();
        addPositionButton(config.audioElementId, 1, '+1s').appendTo(buttonContainer);
        addPositionButton(config.audioElementId, 5, '+5s').appendTo(buttonContainer);
        addPositionButton(config.audioElementId, 10, '+10s').appendTo(buttonContainer);
        addPositionButton(config.audioElementId, 60, '+1m').appendTo(buttonContainer);


        var playTimeIndicator = $('<span id="tracktime"></span>').appendTo(audioContainer);

        setTimeout(function (o) {
            o.playTimeIndicator.html(o.audioElement.currentTime);
        }, config.waitInterval, {playTimeIndicator: playTimeIndicator, audioElement: audioElement});

        playButton.data('audioId', config.audioElementId);
        playButton.on('click', function () {
            allowAutoPlay = toggleAudio(this, playStatusIndicator, 0, allowAutoPlay);
            editor.focus();
        })


        // keydown
        editor.on('key', function (ev) {
            if (ev.data) {
                if (ev.data.keyCode == 13) {
                    insertAudioLink(editor, audioElement, true);
                    ev.cancel();
                }
            }

            var audio = $('#' + playButton.data('audioId'))[0];
            var signum = playButton.find('span').first();
            pauseAudio(audio, signum);

            // reset timeout
            if (timeOutId) {
                clearTimeout(timeOutId);
            }
            timeOutId = setTimeout(function (o) {
                var audio = $('#' + o.playButton.data('audioId'))[0];
                var signum = o.playButton.find('span').first();
                if (audio.currentTime > 1) audio.currentTime -= o.config.repeatInterval;
                playAudio(audio, signum);
            }, 300, {playButton: playButton, config: config});
        });

        editor.on('instanceReady', function (ev) {
            $('iframe').contents().click(function (ev) {
                var element = CKEDITOR.plugins.link.getSelectedLink(editor) || ev.data.element;
                var url = element.$.href;
                var hash = url.substring(url.indexOf("#") + 1);
                if (hash.substring(0, 9) == 'audioPos-') {
                    var position = hash.substring(9);
                    audioElement[0].currentTime = position;
                }
                editor.focus();
                var selection = editor.getSelection();
                var range = selection.getRanges()[0];
                var node = range.endContainer.getParent().getNext();
                selection.selectElement(node);
                range = selection.getRanges()[0];
                range.collapse(false);
                selection.selectRanges([range]);
            });
            // insert initial link into editor (only if it's empty!)
            if (textAreaElement.val() == '') {
                insertAudioLink(editor, audioElement, false);
            }
        });

        return this;
    };

}(jQuery));