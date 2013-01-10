// ml_ui.js
// Contains the code for building the UI
// Whired

// The currently previewed tile
var current_preview_tile;

// The video player overlay
var video_overlay;

// Creates a tile for the specified video
var create_video_tile = function(video) {
	
    // The target size of the file
    var tile_size = {width:'121px',height:'100px',margin:'5px'};
    
    // Create the elements required for a tile
    var tile = $(document.createElement('div'));
    tile.border_overlay = $(document.createElement('div'));
    var thumb_strip_container = $(document.createElement('div'));
    tile.thumb_strip = $(document.createElement('img'));
	var info_box = $(document.createElement('div'));
	var title_box = $(document.createElement('div'));
    var author_box = $(document.createElement('div'));
	
    // Set styles
    var bordered_style = {'font-size':'9px','font-family':'Droid Sans,sans-serif','overflow':'hidden','width':tile_size.width};
    tile.border_overlay.css(bordered_style);
    tile.border_overlay.border_css = {'border-radius':'15px','position':'absolute','height':'100%','width':'100%','z-index':'1','box-shadow':'0px 0px 10px 5px rgba(237,237,237,.4) inset'};
    tile.border_overlay.css(tile.border_overlay.border_css);
    thumb_strip_container.css(bordered_style).css({'position':'relative','float':'left','border-top-left-radius':'15px','border-top-right-radius':'15px','border-bottom':'2px dotted #4F4F4F','height':'100px'});
    tile.css(bordered_style).css({'border-radius':'15px','background':'#454545','position':'relative','margin':tile_size.margin,'float':'left','cursor':'pointer','box-shadow':'-7px 7px 5px rgba(50,50,50,.8)'});
    tile.thumb_strip.css({'width':'607px','height':'100'});
	info_box.css({'clear':'both','position':'relative','width':'100%','height':'30px'});
	title_box.css({'margin-right':'-3px','padding-left':'3px','position':'relative','float':'left','width':'50%','height':'100%'});
	author_box.css({'margin-left':'-5px','padding-right':'3px','position':'relative','text-align':'right','float':'right','width':'50%','height':'100%','color':'#FFF','border-left':'2px dotted #4F4F4F'});
    
    // Set other properties
	tile.video = video;
	tile.thumb_strip.left_offset = 0;
    tile.thumb_strip.get(0).src = video.thumbnail_url;
    tile.view_mode = 0; // 0 = inactive, 1 = thumbnail, 2 = playing
    tile.click(function() {
        if(tile.view_mode === 0) {
            // First click, show thumbnail/slideshow
			tile.view_mode++;
			cycle_thumbs(tile);
            tile.border_overlay.animate({'box-shadow':'0px 0px 10px 5px rgba(30,255,30,.5) inset'}, 1000);
        }
        else if(tile.view_mode === 1) {
            // User has clicked the tile again, time to play the video
            clear_preview(tile);
			
            // show_video_overlay(tile); //Maybe one day this will work..
			$('#video_frame').prop('src','http://motherless.com/view/frame?item='+tile.video.id).load(video_overlay.fadeIn(700));
            tile.view_mode++;
        }
    });

    // Build the tile
    thumb_strip_container.append(tile.thumb_strip);
    tile.append(thumb_strip_container);
    tile.append(tile.border_overlay);
	info_box.append(title_box.append($(document.createElement('a')).prop('href',video.full_url).append(video.title))).append(author_box.append(video.length).append($(document.createElement('br'))).append(video.author));
	tile.append(info_box);
	
	// Add taboo notification if applicable
    if(video.taboo) {
		tile.icon_overlay = $(document.createElement('div'));
		tile.icon_overlay.prop('title','tagged as '+video.taboo).css({'background':'url(images/'+video.taboo+'.png) no-repeat center center','width':'24px','height':'24px','position':'absolute','right':'10px','top':'8px','z-index':'3'})
		.appendTo(tile.border_overlay);
	}
	
    return tile.get(0);
};

// Cycles through the thumbs for the specified tile // TODO remove hardcoded values!
var cycle_thumbs = function(tile) {
	clear_preview(current_preview_tile);
	// Used for cycling immediatly
	var cycle = function() {
		if(tile.thumb_strip.left_offset < tile.thumb_strip.width()-242) {
			
            tile.thumb_strip.left_offset += 121;
            tile.thumb_strip.get(0).style.marginLeft = -tile.thumb_strip.left_offset+'px';
        }
        else {
            tile.thumb_strip.get(0).style.marginLeft = '0px';
            tile.thumb_strip.left_offset = 0;
        }
	};
	cycle();
    tile.interval = setInterval(cycle, 1000);
	current_preview_tile = tile;
};

// Clears the preview for the specified tile
var clear_preview = function(tile) {
	if(tile) { // TODO why??
		clearInterval(tile.interval);
		tile.view_mode = 0;
		tile.border_overlay.animate(tile.border_overlay.border_css, 1000);
	}
};

// Load more videos when the bottom of the page is approaching
var load_by_scroll = function() {

	// TODO Needs to hide stale content?
	if(($(document.body).scrollTop() + document.body.clientHeight)/document.documentElement.clientHeight >= .7) {
		console.log('Scroll pos dictates load!');
		load_live_videos();
	}
};
$(window).scroll(load_by_scroll);

// Things to do when the app is done loading
$(document).ready(function() {
	// Initialize the video overlay
	video_overlay = $('#video_overlay');
	video_overlay.click(function() {
		$('#video_frame').prop('src','');
        video_overlay.fadeOut(700, function() {
            clear_preview(current_preview_tile);
        });
	});
	
	// Begin loading live videos
	loaded_videos_callbacks.push(function(videos) {
		$(videos).each(function() {
			$('#content').append(create_video_tile(this));
		});
	});
	load_live_videos();
});