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
	var new_ttl = $(document.createElement('div'));
	var new_nfo = $(document.createElement('div'));

    // Set styles
    var b_s = {'overflow':'hidden','width':tile_size.width};
    tile.border_overlay.css(b_s);
    tile.border_overlay.border_css = {'background-image':'url(images/ovr.png)','background-position-x':'0','border-radius':'15px','position':'absolute','height':'100%','width':'100%','pointer-events':'none'};
    tile.border_overlay.css(tile.border_overlay.border_css);
    thumb_strip_container.css(b_s).css({'position':'relative','float':'left','border-top-left-radius':'15px','border-top-right-radius':'15px','height':'130px'});
    tile.css(b_s).css({'border-radius':'15px','background':'#454545','position':'relative','margin':tile_size.margin,'float':'left','cursor':'pointer'});
    tile.thumb_strip.css({'margin-top':'15px','width':'607px','height':'100'});
    var c_s = {'position':'absolute','left':'15px','right':'15px','height':'13px','overflow':'hidden','white-space':'nowrap'};
    new_ttl.css(c_s).css({'top':'2px'});
    new_nfo.css(c_s).css({'bottom':'0px','color':'#FFF'});

    // Set other properties
	tile.video = video;
	tile.thumb_strip.left_offset = 0;
    tile.thumb_strip.get(0).src = video.thumbnail_url;
    tile.view_mode = 0; // 0 = inactive, 1 = thumbnail, 2 = playing
    tile.click(function() {
        if(tile.view_mode === 0) {
            // First click, show thumbnail/slideshow
			tile.view_mode++;
			tile.border_overlay.css({'background-position-x':'-121'});
			cycle_thumbs(tile);
        }
        else if(tile.view_mode === 1) {
            // User has clicked the tile again, time to play the video
            clear_preview(tile);
			$('#video_frame').prop('src','http://motherless.com/view/frame?item='+tile.video.id).load(video_overlay.fadeIn(700));
            tile.view_mode++;
        }
    });

	// Build the tile
	thumb_strip_container.append(new_ttl.append($(document.createElement('a')).prop('href',video.full_url).append(video.title)))
		.append(tile.thumb_strip)
		.append(new_nfo.append(video.length).append(' | ').append(video.author)); // TODO bind click evt to load authors vids in drawer
    tile.append(thumb_strip_container);
    tile.append(tile.border_overlay);
	
	// Add taboo notification if applicable
    if(video.taboo) {
		tile.icon_overlay = $(document.createElement('div'));
		tile.icon_overlay.prop('title','tagged as '+video.taboo).css({'background':'url(images/'+video.taboo+'.png) no-repeat center center','width':'24px','height':'24px','position':'absolute','right':'3px','top':'17px','z-index':'3'})
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
		tile.border_overlay.css(tile.border_overlay.border_css, 1000);
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
	// Initialize UI event handlers
	$('#btn2d').click(function(){
        $(this).toggleClass('down');
        $('#btn3d').prop('class','togglebutton');
    });
    $('#btn3d').click(function(){
        $(this).toggleClass('down');
        $('#btn2d').prop('class','togglebutton');
    });
    console.log($('.togglebutton'));
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
			$(content).append(create_video_tile(this));
		});
	});
	load_live_videos();
});