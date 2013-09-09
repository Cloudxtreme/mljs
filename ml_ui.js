// ml_ui.js
// Contains the code for building the UI
// Whired

// The currently previewed tile
var current_preview_tile;

// The video player overlay
var video_overlay;

// Whether or not the user is browsing a single author
var author_mode;

// Creates a tile for the specified video
var create_video_tile = function(video) {
    // Create the elements required for a tile
    var tile = $('#tile').clone(true);
    tile.thumb_strip = tile.find('#thumbstrip');

    // Configure tile
    tile.thumb_strip.css({'background-image':'url('+video.thumbnail_url+')'});
    tile.find('#title').prop('href',video.full_url).text(video.title);
    tile.find('#length').text(video.length);
    tile.find('#author').text(video.author).click(function(evt) {
            evt.stopPropagation();
            if(!author_mode) {
                load_user_videos(video.author,function(cbv) {
                    if(cbv.length > 0) {
                        author_mode = true;
                        var d = $('#drawer');
                        $(cbv).each(function() {
                            $(d).append(create_video_tile(this));
                        });
                        // Open the drawer
                        $(d).fadeIn(700, function() {
                            // Hide normal content
                            $('#content').hide();
                        });   
                    }
                });
            }
        });
    tile.css({'display':'block'});

    // Set other properties
	tile.video = video;
	tile.thumb_strip.left_offset = 0;
    tile.view_mode = 0; // 0 = inactive, 1 = thumbnail, 2 = playing
    tile.click(function(evt) {
        evt.stopPropagation();
        if(tile.view_mode === 0) {
            // First click, show thumbnail/slideshow
			tile.view_mode++;
			tile.css({'background-color':'#6495ED'});
			cycle_thumbs(tile);
        }
        else if(tile.view_mode === 1) {
            // User has clicked the tile again, time to play the video
            clear_preview(tile);
			$('#video_frame').prop('src','http://motherless.com/view/frame?item='+tile.video.id).load(video_overlay.fadeIn(700));
            tile.view_mode++;
        }
    });

	// Add taboo notification if applicable
    if(video.taboo) {
		tile.icon_overlay = $(document.createElement('div'));
		tile.icon_overlay.prop('title','tagged as '+video.taboo).css({'background':'url(images/'+video.taboo+'.png) no-repeat center center','width':'24px','height':'24px','position':'absolute','right':'3px','top':'17px'})
		.appendTo(tile);
	}
	
    return tile.get(0);
};

// Cycles through the thumbs for the specified tile // TODO remove hardcoded values!
var cycle_thumbs = function(tile) {
	clear_preview(current_preview_tile);
	// Used for cycling immediatly
	var cycle = function() {
		if(tile.thumb_strip.left_offset < tile.thumb_strip.width()-400) {
            tile.thumb_strip.left_offset += 200;
            tile.thumb_strip.get(0).style.marginLeft = -tile.thumb_strip.left_offset+'px';
        }
        else {
            tile.thumb_strip.get(0).style.marginLeft = '0px';
            tile.thumb_strip.left_offset = 0;
        }
	};
	cycle();
    tile.interval = setInterval(cycle, 800);
	current_preview_tile = tile;
};

// Clears the preview for the specified tile
var clear_preview = function(tile) {
	if(tile) {
		clearInterval(tile.interval);
		tile.view_mode = 0;
        tile.css({'background-color':'#4169E1'});
	}
};

// Appends videos to #content
var append_to_content = function(videos) {
    $(videos).each(function() {
        $(content).append(create_video_tile(this));
    });
    $('#loading').css({'display':'none'});
};

// Load more videos when the bottom of the page is approaching
var load_by_scroll = function() {
	// TODO Needs to hide stale content?
	if(($(document.body).scrollTop() + document.body.clientHeight)/document.documentElement.clientHeight >= .7) {
		console.log('Scroll pos dictates load!');
        $('#loading').css({'display':'block'});
		load_live_videos(append_to_content);
	}
};
$(window).scroll(load_by_scroll);

// Things to do when the app is done loading
$(document).ready(function() {
	// Initialize UI event handlers
    var drw = $(drawer);
    $(drw).click(function() {
        author_mode = false;
        $(drw).fadeOut(700, function() {
            $('#content').show();
            $(drw).empty();
        });
    });
	video_overlay = $('#video_overlay');
	video_overlay.click(function() {
		$('#video_frame').prop('src','');
        video_overlay.fadeOut(700, function() {
            clear_preview(current_preview_tile);
        });
	});
	$('#loading').css({'display':'block'});
    load_live_videos(append_to_content);
});