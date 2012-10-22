/** The current thumb cycle interval */
var current_preview_tile;

/** An array of the videos currently on the page */
var current_videos = new Array();

var create_video_overlay = function() {
	var overlay = $('#video_overlay');
	overlay.video = $('#video_player');
	
	return overlay;
};
var video_overlay;

/**
 * Creates the div that represents a video
 */
var create_video_tile = function(video) {
    
	// Make sure this video isn't added again
	current_videos.push(video.id);
	
    // The target size of the file
    var tile_size = {width:'121px', height:'100px'};
    
    // Create the elements
    var tile = $(document.createElement('div'));
	tile.video = video;
    tile.border_overlay = $(document.createElement('div'));
    var thumb_strip_container = $(document.createElement('div'));
    tile.thumb_strip = $(document.createElement('img'));
    tile.thumb_strip.left_offset = 0;
    
    // Set styles
    var bordered_style = {'border-radius':'15px','overflow':'hidden','width':tile_size.width,'height':tile_size.height};
    tile.border_overlay.css(bordered_style);
    tile.border_overlay.border_css = {'position':'absolute','z-index':'1','box-shadow':'0px 0px 10px 5px rgba(237,237,237,.4) inset'};
    tile.border_overlay.css(tile.border_overlay.border_css);
    thumb_strip_container.css(bordered_style);
    thumb_strip_container.css({'z-index':'0','float':'left'});
    tile.css(bordered_style);
    tile.css({'margin':'5px','float':'left','cursor':'pointer','box-shadow':'-7px 7px 5px rgba(50,50,50,.8)'});
    tile.thumb_strip.css({'width':'607px','height':'100'});
    
    // Set other properties
    tile.thumb_strip.get(0).src = video.thumbnail_url;
    tile.view_mode = 0; // 0 = inactive, 1 = thumbnail, 2 = playing
    tile.click(function() {
        if(tile.view_mode === 0) {
            // First click, show thumbnail/slideshow
            tile.border_overlay.animate({'box-shadow':'0px 0px 10px 5px rgba(30,255,30,.5) inset'}, 1000);
            cycle_thumbs(tile);
            tile.view_mode++;
        }
        else if(tile.view_mode === 1) {
            // User has clicked the tile again, time to play the video
            clear_preview(tile);
            show_video_overlay(tile);
            tile.view_mode++;
        }
    });

    // Build the tile
    thumb_strip_container.append(tile.thumb_strip);
    tile.append(thumb_strip_container);
    tile.append(tile.border_overlay);
    
    return tile.get(0);
};

/**
 * Displays the video overlay for the specified tile
 * @param tile the tile the overlay cooresponds to
 */
var show_video_overlay = function(tile) {

	$.ajax({
			type: 'GET', 
			url: tile.video.url,
			dataType: 'html',
			success: function(data) {
				// Find the flv file
				var t1 = "__fileurl = '";
				var t2 = "';";
				var url = data.substring(data.indexOf(t1)+t1.length)
				url = url.substring(0, url.indexOf(t2));
				console.log('URL: '+url);
				video_overlay.video.get(0).src = url+'?start=0';
				// Show and play
				video_overlay.fadeIn(700, function() {
				// God, I hate this..
				jwplayer('video_player').setup({
					flashplayer: '/jwplayer/player.swf',
					file: url,
					image: 'http://thumbs.motherlessmedia.com/thumbs/'+tile.video.id+'.jpg',
					provider: 'http',
					mute: false,
					controlbar: 'over',
					repeat: 'always',
					height: '100%',
					width: '100%'
				});
					
					//video_overlay.video.get(0).load();
					//video_overlay.video.get(0).play();
				});
			}
		});
		
	video_overlay.click(function() {
        // Stop playing and go back to thumbnail mode
		video_overlay.video.get(0).pause();
        video_overlay.fadeOut(700, function() {
            clear_preview(tile);
        });
    });
};

/**
 * Clears the preview for the specified tile
 * @param tile the tile to clear
 */
var clear_preview = function(tile) {
	if(tile) {
		clearInterval(tile.interval);
		tile.view_mode = 0;
		tile.border_overlay.animate(tile.border_overlay.border_css, 1000);
	}
};

/**
 * Cycles through the thumbs for a tile
 * @param tile the tile to cycle
 */
var cycle_thumbs = function(tile) {
	clear_preview(current_preview_tile);
    tile.interval = setInterval(function() {
        if(tile.thumb_strip.left_offset < tile.thumb_strip.width()-242) {
            tile.thumb_strip.left_offset += 121;
            tile.thumb_strip.get(0).style.marginLeft = -tile.thumb_strip.left_offset+'px';
        }
        else {
            tile.thumb_strip.get(0).style.marginLeft = '0px';
            tile.thumb_strip.left_offset = 0;
        }
    }, 1000);
	current_preview_tile = tile;
};

/**
 * Loads live videos from motherless
 */
var load_live_videos = function(){
	if(!videos_are_loading && !load_timeout) {
		videos_are_loading = true;
		console.log('Loading new videos..');
		$.ajax({
			type: 'GET', 
			url: 'http://motherless.com/live/videos',
			dataType: 'html',
			success: function(data) {
				load_timeout = setTimeout(load_timeout_callback, 5000);
				// Build the videos
				var videos;
				$(data).find('div.thumbnail.mediatype_video > div > a').each(function() {
					if(current_videos.indexOf(this.rel) === -1) {
						var video = {};
						video.id = this.rel;
						video.url = this.href;
						video.thumbnail_url = 'http://thumbs.motherlessmedia.com/thumbs/'+video.id+'-strip.jpg';
						$('#content').append(create_video_tile(video));
					}
				});
				videos_are_loading = false;
				// May have only been repeats, load again if needed
				load_by_scroll();
			}
		});
	}
	else if(load_timeout) {
		reload_after_timeout = true;
	}
};

var load_timeout;
var reload_after_timeout;
var videos_are_loading;
var load_timeout_callback = function() {
	clearTimeout(load_timeout);
	load_timeout = undefined;
	if(reload_after_timeout) {
		load_live_videos();
		reload_after_timeout = false;
	}
};

/**
 * Load more videos when the bottom of the page is approaching
 */
var load_by_scroll = function() {
	if(($(document.body).scrollTop() + document.body.clientHeight)/document.documentElement.clientHeight >= .7) {
		console.log('Scroll pos dictates load!');
		load_live_videos();
	}
};
$(window).scroll(load_by_scroll);

/**
 * Load live videos when the document is ready
 */
$(document).ready(function() {
	video_overlay = create_video_overlay();
	//$(document.body).append(video_overlay);
	load_live_videos();
});