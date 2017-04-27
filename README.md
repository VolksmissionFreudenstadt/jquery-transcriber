# jquery-transcriber
Add transcription functionality to textareas with jquery and ckeditor

## Prerequisites
### Javascript
* jQuery & Bootstrap (e.g. `//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js`) 
* CKEditor (e.g. `//cdn.ckeditor.com/4.6.2/basic/ckeditor.js`)
* CKEditor jQuery plugin (e.g. `//cdn.ckeditor.com/4.6.2/basic/adapters/jquery.js`)
### CSS
* Bootstrap (e.g. `//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css`)
* Font Awesome (e.g. `//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css`)

## Installation
* Put the javascript file somewhere on your server and include it into your html.
* Import the required prerequisites (see above)
* Set up at least one textarea for transcription:
  ```html
  <textarea id="my_text"></textarea>
  ```
* Call the jQuery plugin on this textarea:
  ```javascript
  $('#my_text').transcribe({});
  ```
  
  
  
## Options
You can provide options to the transcriber by passing them along with your javascript setup:
  ```javascript
  $('#my_text').transcribe({
    option1: value1,
    option2: value2
  });
  ```
  
### Available options:

Option name | Default value | Explanation
------------|---------------|------------
audioElementId | audio | Id value for the `<audio>` tag created by the transcriber.
playButtonId | playButton | Id value for the play/pause button created by the transcriber.


