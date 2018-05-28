var currentPage = $(".page_0");
var dWidth = {{dWidth}},
	dHeight = {{dHeight}},
	loaded = 0,
	wWidth=0,
	wHeight=0;

function pageInit() {
	wWidth = $(window).width() > dWidth ? dWidth : $(window).width();
	wHeight = $(window).height() / wWidth * dWidth;
	var contain_scale = wHeight / wWidth > dHeight / dWidth ? wWidth / dWidth : wHeight / dHeight;
	var cover_scale = wHeight / wWidth > dHeight / dWidth ? wHeight / dHeight : wWidth / dWidth;
	$(".page_box").css({
		"width": dWidth + "px",
		"height": dHeight + "px",
		"top": (wHeight - dHeight) / 2 + "px"
	});
	$(".page_box.top").css({
		"width": dWidth + "px",
		"height": dHeight + "px",
		"top": "0px"
	});
	$(".page_box.bottom").css({
		"width": dWidth + "px",
		"height": dHeight + "px",
		"top": "auto",
		"bottom": "0px"
	});
	$(".page_box.contain").css({
		"transform-style": "preserve-3d",
		"-webkit-transform-style": "preserve-3d",
		"transform": "scale(" + contain_scale + ")",
		"-webkit-transform": "scale(" + contain_scale + ")"
	});
	$(".page_box.cover").css({
		"transform-style": "preserve-3d",
		"-webkit-transform-style": "preserve-3d",
		"transform": "scale(" + cover_scale + ")",
		"-webkit-transform": "scale(" + cover_scale + ")"
	});
}

function loaderText() {
	var total = $("img").length;
	$("img").on("load", function() {
		loaded++;
		$(".loaderText").text(parseInt(loaded / total * 100) + "%");
	});
}

function cssWithPrefix(a, b) {
	var pre = ["", "-o-", "-ms-", "-moz-", "-webkit-"];
	var withPre = {};
	$.each(pre, function(i) {
		withPre[pre[i] + a] = b;
	});
	return withPre;
}

var sliding = false;

function slideTo(nextPage) {
	if(sliding) {
		return false;
	}
	sliding = true;
	var thisPage = currentPage;
	thisPage.trigger("beforeHide");
	nextPage.trigger("beforeShow");
	if(thisPage.index() < nextPage.index()) {
		nextPage.show().css(cssWithPrefix("transform", "translate(0%, 100%)"));
		setTimeout(function() {
			thisPage.addClass("page_transition").css(cssWithPrefix("transform", "translate(0%, -100%)"));
			nextPage.addClass("page_transition").css(cssWithPrefix("transform", "translate(0%, 0%)"));
		}, 50);

	} else {
		nextPage.show().css(cssWithPrefix("transform", "translate(0%, -100%)"));
		setTimeout(function() {
			thisPage.addClass("page_transition").css(cssWithPrefix("transform", "translate(0%, 100%)"));
			nextPage.addClass("page_transition").css(cssWithPrefix("transform", "translate(0%, 0%)"));
		}, 50);
	}
	setTimeout(function() {
		thisPage.removeClass("page_transition").hide();
		nextPage.removeClass("page_transition");
		thisPage.trigger("afterHide");
		nextPage.trigger("afterShow");
		currentPage = nextPage;
		sliding = false;
	}, 500);
}

$(window).on("load", function() {
	if($(".music_btn").hasClass("music_play")) {
		$(".bgm")[0].play();
	}
	$(".page_0").fadeOut();
	var firstPage = $(".page_1");
	firstPage.fadeIn();
	firstPage.trigger("afterShow");
	$(".page_0").trigger("afterHide");
	currentPage = firstPage;
});

$(document).ready(function() {
	pageInit();
	loaderText();
	var touchSY = 0,
		touchEY = 0;
	$(".view").on("touchstart", ".page", function(e) {
		touchSY = e.originalEvent.targetTouches[0].clientY;
		touchEY = e.originalEvent.targetTouches[0].clientY;
	});
	$(".view").on("touchmove", ".page", function(e) {
		e.preventDefault();
		touchEY = e.originalEvent.targetTouches[0].clientY;
	});
	$(".view").on("touchend", ".page", function(e) {
		if(touchSY - touchEY > 50 && $(this).index() < $(".page").length - 1 && $(this).index() > 0 && !$(this).hasClass("slidenextdisable")) {
			slideTo($(this).next());
		} else if(touchEY - touchSY > 50 && $(this).index() > 1 && !$(this).hasClass("slideprevdisable")) {
			slideTo($(this).prev());
		}
	});
	$(".clickslide").click(function(e) {
		var nextPage = $($(this).attr("data-destination"));
		slideTo(nextPage);
	});

	$(".music_btn").click(function(e) {
		if($(this).hasClass("music_play")) {
			$(this).removeClass("music_play").addClass("music_pause");
			$(".bgm")[0].pause();
		} else {
			$(this).removeClass("music_pause").addClass("music_play");
			$(".bgm")[0].play();
		}
	});
});