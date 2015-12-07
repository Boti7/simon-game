/*
 * This is the main JavaScript file of the Simon game.
 *
 * Copyright (c) 2015 Botond Horvath
 * Licensed under the MIT License. See "LICENSE.txt".
 */

// Color names array, color IDs from 1 to 4
var color = ["", "red", "blue", "yellow", "green"];
var round = 1;				// Current round
var maxRound;				// Max round got from cookie
var pattern = new Array();	// Random pattern
var response = new Array();	// Response pattern
var patternIndex;			// Current color id, animation loop increses it
var run = false;			// It's not running
var lightTime = 600;		// Simon button light up time (milliseconds)
var startAnimInterval;		// Interval for the start screen animation
var animationLoopInterval;	// Interval for the animation loop
var patternRemaining;		// Animation loop count down



// ================== //
// Set a cookie width 18250 days from now exp date
// @param c_name: name of the cookie
// @param c_value: value of the cookie
function setCookie(c_name, c_value) {
	var exdate = new Date();
	exdate.setDate(exdate.getDate() + 18250);
	document.cookie = c_name + "=" + escape(c_value) + "; expires=" + exdate.toUTCString();
}

// ================== //
// Get the value of a cookie
// @param c_name: name of the cookie
// @return value of the cookie
function getCookie(c_name) {
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1) {
		c_start = c_value.indexOf(c_name + "=");
	}
	if (c_start == -1) {
		c_value = null;
	}
	else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1) {
			c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start,c_end));
	}
	return c_value;
}



// ================== //
// Play the animation on the start screen
function playStartAnim() {
	var idlei = 1;
	startAnimInterval = setInterval(function() {
		lightUp(idlei);
		if (idlei > 1)	idlei--;
		else 			idlei = 4;
	}, lightTime);
}

// ================== //
// Stop the animation on the start screen
function stopStartAnim() {
	clearInterval(startAnimInterval);
	$('.simon-btn').removeClass('simon-btn-active');
}


// ================== //
// Light up a button for the time specified in the lightTime variable
// @param colorID (number from 1 to 4)
function lightUp(colorID) {
	$('.simon-btn').removeClass('simon-btn-active');
	$('#' + color[colorID]).addClass('simon-btn-active');
	setTimeout(function() {
		$('#' + color[colorID]).removeClass('simon-btn-active');
	}, lightTime);
}


// ================== //
// Start the color animation
function startAnimationLoop() {
	patternRemaining = pattern.length;
	patternIndex = 0;
	animationLoopInterval = setInterval(function() {
		if(patternRemaining > 0) { 
			patternRemaining--;
			lightUp(pattern[patternIndex]);
			patternIndex++;
		}
		else {
			clearInterval(animationLoopInterval);
			$('.status-text').html(navigator.mozL10n.get('you-turn'));
			run = 1;
		}
	}, lightTime*1.5);
}


// ================== //
// Start the game
function startGame() {
	if(run == false) {
		stopStartAnim();
		$('.start-bg, .start').css({display: 'none'});
		$('.round-info-cnt').css({display: 'block'});
		$('.status-text').html(navigator.mozL10n.get('listen'));
		pattern[0] = Math.floor((Math.random()*4)+1);
		startAnimationLoop();
		$('.round-value').text(round);
	}
}


// ================== //
// Handle the clicks on the colored buttons
function simonBtnClick() {
	if(run == true) {
		response.push($(this).attr('data-colorid'));	// Add the clicked color's id to the response array

		// If the last clicked color not equals to the pattern then it's loose
		if(response[response.length-1] != pattern[response.length-1]) {

			// If it's a new max round
			if (getCookie('maxround') < round) {
				setCookie('maxround', round);	// Save the new max round
				alert(navigator.mozL10n.get("lose-newmax",  {round: --round}));
			}
			else {
				alert(navigator.mozL10n.get("lose",  {round: --round}));
			}
			location.reload();	// Refresh the page

		}

		// If this was the last color, go to next round
		if(response.length == pattern.length) {
			setTimeout(function() {
				run = 0;

				// Speed up
				if(round >= 5)			lightTime = 400;
				else if(round >= 10)	lightTime = 300;
				else if(round >= 15)	lightTime = 250;

				if($('.auto-next-turn').attr('checked')) {
					nextRound();
				}
				else {
					$('.next-round-btn').css({display:"block"});
					$('.status-text').css({display:"none"});	
				}
			}, 500);
		}
	}
}


// ================== //
// Play the next round
function nextRound() {
	round++;
	$('.round-value').text(round);
	$('.next-round-btn').css({display:"none"});
	$('.status-text').css({display:"block"});
	$('.status-text').text(navigator.mozL10n.get("listen"));
	pattern.push(Math.floor((Math.random()*4)+1));
	response = [];
	setTimeout(startAnimationLoop, 500);
}



$(document).ready(function() {

	// Get the value of "auto-next-turn" switch from cookie
	// By default the switch is "true"
	if (getCookie("auto-next-turn") == "false") {
		$('.auto-next-turn').attr('checked', false);
	}


	// Get the max round value
	// By default the max round is hidden, show it if there is saved value
	maxRound = getCookie('maxround');
	if(maxRound != null) {
		$('.max-round-cnt').css({display: 'block'});
		$('.max-round-value').text(maxRound);
	}


	// Play the run around animation
	playStartAnim();


	// Bind the "startGame" function to ".start" div
	$('.start').click(startGame);


	// Bind the "simonBtnClick" function to the simon buttons
	$('.simon-btn').click(simonBtnClick);


	// Bind the "nextRound" function to the "Next round" button (it's needed when "auto-next-round" is off)
	$('.next-round-btn').click(nextRound);


	$('.quit-btn').click(function() {
		if (maxRound < round-1) {
			alert(navigator.mozL10n.get("newmax",  { round: --round }));
			setCookie('maxround', round);
		}
		location.reload();
	});


	// Open the options menu when the ".menu-icon" has clicked
	$('.menu-icon').click(function() {
		$('.menu-close-icon').css({display: 'block'});
		$('.settings').addClass('open');
		$('body').addClass('noscroll');
	});

	// Close the options menu when the ".menu-close-icon" has clicked
	$('.menu-close-icon, .settingsbg').click(function() {
		$('.menu-close-icon').css({display: 'none'});
		$('.settings').removeClass('open');
		$('body').removeClass('noscroll');
	});

	// Save the state of "auto-next-turn" switch when it changed
	$('.auto-next-turn').change(function() {
		setCookie('auto-next-turn', $('.auto-next-turn').attr('checked'));
	});

});
