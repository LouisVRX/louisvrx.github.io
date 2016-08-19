console.log(webAudioAmbisonic);

// Setup audio context and variables
var AudioContext = window.AudioContext // Default
    || window.webkitAudioContext; // Safari and old versions of Chrome
var context = new AudioContext; // Create and Initialize the Audio Context

// added resume context to handle Firefox suspension of it when new IR loaded
// see: http://stackoverflow.com/questions/32955594/web-audio-scriptnode-not-called-after-button-onclick
context.onstatechange = function() {
    if (context.state === "suspended") { context.resume(); }
}

var sound_1 = "sounds/attacks.wav";
var sound_2 = "sounds/nearfield.wav";
var sound_3 = "sounds/purrs.wav";
var irUrl_0 = "node_modules/web-audio-ambisonic/examples/IRs/HOA4_filters_virtual.wav";
var irUrl_1 = "node_modules/web-audio-ambisonic/examples/IRs/HOA4_filters_direct.wav";
var irUrl_2 = "node_modules/web-audio-ambisonic/examples/IRs/room-medium-1-furnished-src-20-Set1.wav";

var maxOrder = 3;
var orderOut = 3;
var soundBuffer, sound;

// define HOA order limiter (to show the effect of order)
var limiter = new webAudioAmbisonic.orderLimiter(context, maxOrder, orderOut);
console.log(limiter);
// define HOA rotator
var rotator = new webAudioAmbisonic.sceneRotator(context, maxOrder);
rotator.init();
console.log(rotator);

// binaural HOA decoder
var decoder = new webAudioAmbisonic.binDecoder(context, maxOrder);
console.log(decoder);
// intensity analyser
var analyser = new webAudioAmbisonic.intensityAnalyser(context, maxOrder);
console.log(analyser);
// converter from ACN to FOA FuMa
var converterA2F = new webAudioAmbisonic.converters.acn2bf(context);
console.log(converterA2F);
// output gain
var masterGain = context.createGain();

// connect HOA blocks
limiter.out.connect(rotator.in);
rotator.out.connect(decoder.in);
decoder.out.connect(masterGain);
masterGain.connect(context.destination);

rotator.out.connect(converterA2F.in);
converterA2F.out.connect(analyser.in);

// function to assign sample to the sound buffer for playback (and enable playbutton)
var assignSample2SoundBuffer = function(decodedBuffer) {
    soundBuffer = decodedBuffer;
    document.getElementById('play').disabled = false;
}

// load samples and assign to buffers
var assignSoundBufferOnLoad = function(buffer) {
    soundBuffer = buffer;
    document.getElementById('play').disabled = false;
}

var loader_sound_1 = new webAudioAmbisonic.HOAloader(context, maxOrder, sound_1, assignSoundBufferOnLoad);
loader_sound_1.load();
var loader_sound_2 = new webAudioAmbisonic.HOAloader(context, maxOrder, sound_2, assignSoundBufferOnLoad);
var loader_sound_3 = new webAudioAmbisonic.HOAloader(context, maxOrder, sound_3, assignSoundBufferOnLoad);

// load filters and assign to buffers
var assignFiltersOnLoad = function(buffer) {
    decoder.updateFilters(buffer);
}

var loader_filters = new webAudioAmbisonic.HOAloader(context, maxOrder, irUrl_1, assignFiltersOnLoad);
loader_filters.load();

// lookup table for the compass data -> rotator
var lookup = new Array(361) ;
for (var i = 0 ; i < 360 ; i++) {
	if (i < 180){ lookup[i] = i; }
	if (i >= 180){ lookup[i] = (i-360); }};
	lookup[360] = 0;


$(document).ready(function() {
   // Init event listeners
    document.getElementById('play').addEventListener('click', function() {
        sound = context.createBufferSource();
        sound.buffer = soundBuffer;
        sound.loop = true;
        sound.connect(limiter.in);
        sound.start(0);
        sound.isPlaying = true;
        document.getElementById('play').disabled = true;
        document.getElementById('stop').disabled = false;
    });
    document.getElementById('stop').addEventListener('click', function() {
        sound.stop(0);
        sound.isPlaying = false;
        document.getElementById('play').disabled = false;
        document.getElementById('stop').disabled = true;
    });

    document.getElementById('N1').addEventListener('click', function() {
        orderOut = 1;
        orderValue.innerHTML = orderOut;
        limiter.updateOrder(orderOut);
        limiter.out.connect(rotator.in);
    });
    document.getElementById('N2').addEventListener('click', function() {
        orderOut = 2;
        orderValue.innerHTML = orderOut;
        limiter.updateOrder(orderOut);
        limiter.out.connect(rotator.in);
    });
    document.getElementById('N3').addEventListener('click', function() {
        orderOut = 3;
        orderValue.innerHTML = orderOut;
        limiter.updateOrder(orderOut);
        limiter.out.connect(rotator.in);
    });
    
   document.getElementById('S1').addEventListener('click', function() {
        soundChoice.innerHTML = 1 ;
        
        sound.stop(0);
        sound.isPlaying = false;
        document.getElementById('play').disabled = false;
        document.getElementById('stop').disabled = true;
        
        loader_sound_1.load();
    });
    document.getElementById('S2').addEventListener('click', function() {
        soundChoice.innerHTML = 2;
        
        sound.stop(0);
        sound.isPlaying = false;
        document.getElementById('play').disabled = false;
        document.getElementById('stop').disabled = true;
        
        loader_sound_2.load();
    });
    document.getElementById('S3').addEventListener('click', function() {
        soundChoice.innerHTML = 3;
        sound.stop(0);
        sound.isPlaying = false;
        document.getElementById('play').disabled = false;
        document.getElementById('stop').disabled = true;
        
        loader_sound_3.load();
    });
});

	window.addEventListener('deviceorientation', function(evenement) {
		document.getElementById("alpha").innerHTML = Math.round( evenement.alpha );
		document.getElementById("beta").innerHTML = Math.round( evenement.beta );
		updateRotator(Math.round(evenement.alpha), Math.round(evenement.beta));
	}),false;

	var updateRotator = function(alpha, beta) {
		rotator.yaw = lookup[alpha];
		document.getElementById("YAW").innerHTML = rotator.yaw;
		rotator.beta = beta;
		rotator.updateRotMtx();
	};