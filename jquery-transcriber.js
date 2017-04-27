/**
 * Created by chris on 27.04.2017.
 */


function formatSecondsAsTime(secs, format) {
    var hr  = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600))/60);
    var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

    if (hr < 10)   { hr    = "0" + hr; }
    if (min < 10) { min = "0" + min; }
    if (sec < 10)  { sec  = "0" + sec; }
    if (hr)            { hr   = "00"; }

    if (format != null) {
        var formatted_time = format.replace('hh', hr);
        formatted_time = formatted_time.replace('h', hr*1+""); // check for single hour formatting
        formatted_time = formatted_time.replace('mm', min);
        formatted_time = formatted_time.replace('m', min*1+""); // check for single minute formatting
        formatted_time = formatted_time.replace('ss', sec);
        formatted_time = formatted_time.replace('s', sec*1+""); // check for single second formatting
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

function repositionAudio(audio, interval) {
    if (interval < 0) {
        if (audio.currentTime > interval) {
            audio.currentTime += interval;
        } else {
            audio.currentTime = 0;
        }
    } else {
        if (audio.currentTime < (audio.duration-interval)) {
            audio.currentTime += interval;
        } else {
            audio.currentTime = audio.duration;
        }
    }
}

function repositionButton(audioId, interval, title) {
    var o = '<button class="btn btn-default" onclick="repositionAudio(document.getElementById(\''+audioId+'\'), '+interval.toString()+')">';
    if (interval <0 ) {
        o += '<span class="fa fa-backward"></span> ';
    }
    o += title;
    if (interval >0 ) {
        o += ' <span class="fa fa-forward"></span>';
    }
    o += '</button>';
    return $(o);
}


(function ($) {

    $.fn.transcribe = function (config) {
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
        var audioElement = $('<audio src="' + audioFile + '" id="' + config.audioElementId + '" ontimeupdate="document.getElementById(\'tracktime\').innerHTML = formatSecondsAsTime(Math.floor(this.currentTime)) + \' [Gesamt: \' + formatSecondsAsTime(Math.floor(this.duration))+ \']\';"></audio>').appendTo(audioContainer);

        // add buttons
        var buttonContainer = $('<div class="form-group"></div>').insertAfter(audioContainer);

        repositionButton(config.audioElementId, -60, '-1m').appendTo(buttonContainer);
        repositionButton(config.audioElementId, -10, '-10s').appendTo(buttonContainer);
        repositionButton(config.audioElementId, -5, '-5s').appendTo(buttonContainer);
        repositionButton(config.audioElementId, -1, '-1s').appendTo(buttonContainer);
        var playButton = $('<button class="btn btn-success ' + config.playButtonClass + ' button-play" id="' + config.playButtonId + '"><span class="fa fa-play"></button> ').appendTo(buttonContainer);
        var playStatusIndicator = playButton.find('span').first();
        repositionButton(config.audioElementId, 1, '+1s').appendTo(buttonContainer);
        repositionButton(config.audioElementId, 5, '+5s').appendTo(buttonContainer);
        repositionButton(config.audioElementId, 10, '+10s').appendTo(buttonContainer);
        repositionButton(config.audioElementId, 60, '+1m').appendTo(buttonContainer);


        var playTimeIndicator = $('<span id="tracktime"></span>').appendTo(audioContainer);

        setTimeout(function(o) {
            o.playTimeIndicator.html(o.audioElement.currentTime);
        }, 200, {playTimeIndicator: playTimeIndicator, audioElement: audioElement});

        playButton.data('audioId', config.audioElementId);
        playButton.on('click', function() {
            var audio = $('#'+$(this).data('audioId'))[0];
            if (playStatusIndicator.hasClass('fa-play')) {
                playAudio(audio, playStatusIndicator);
            } else {
                pauseAudio(audio, playStatusIndicator);
            }
            editor.focus();
        })

        // keydown
        editor.on('key', function(ev) {
            if (ev.data.keyCode==13)
            {
                ev.cancel();
                console.log('enter');
            }

            var audio = $('#'+playButton.data('audioId'))[0];
            var signum = playButton.find('span').first();
            pauseAudio(audio, signum);

            // reset timeout
            if (timeOutId) {
                clearTimeout(timeOutId);
            }
            timeOutId = setTimeout(function(playButton) {
                var audio = $('#'+playButton.data('audioId'))[0];
                var signum = playButton.find('span').first();
                if (audio.currentTime > 1) audio.currentTime -= 1;
                playAudio(audio, signum);
            }, 300, playButton);
        });



        return this;
    };

}(jQuery));