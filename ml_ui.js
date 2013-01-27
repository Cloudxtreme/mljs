// ml_ui.js
// Contains the code for building the UI
// Whired

// The currently previewed tile
var current_preview_tile;

// The video player overlay
var video_overlay;

// Whether or not the user is browsing a single author
var author_mode;

// Count of columns per row
var col_ct;

// Target size for tiles
var tile_size = {width:'121px',height:'100px',margin:'5px'};

// Creates a tile for the specified video
var create_video_tile = function(video) {
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
    tile.click(function(evt) {
        evt.stopPropagation();
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
		.append(new_nfo.append(video.length).append(' | ').append(video.author).click(function(evt) {
            evt.stopPropagation();
            if(!author_mode) {
                load_user_videos(video.author,function(cbv) {
                    if(cbv.length > 0) {
                        author_mode = true;
                        $(cbv).each(function() {
                            $(drawer).append(create_video_tile(this));
                        });
                        // Open the drawer
                        $(drawer).fadeIn(700, function() {
                            // Hide normal content
                            $(content).hide();
                        });   
                    }
                });
            }
        }));
    tile.append(thumb_strip_container);
    tile.append(tile.border_overlay);
	
	// Add taboo notification if applicable
    if(video.taboo) {
		tile.icon_overlay = $(document.createElement('div'));
		tile.icon_overlay.prop('title','tagged as '+video.taboo).css({'background':'url(images/'+video.taboo+'.png) no-repeat center center','width':'24px','height':'24px','position':'absolute','right':'3px','top':'17px'})
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
	if(tile) {
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
	// Initialize UI
    var con = $('#content');
    col_ct = con.width()/(parseInt(tile_size.width)+parseInt(tile_size.margin)*2);
    alert(col_ct);
    con.mousewheel(function(e,d) {
        if(d > 0) { // Scroll up
            alert('up');
        }
        else { // Scroll down
            alert('down');
        }
    });
    var drw = $(drawer);
    drw.click(function() {
        author_mode = false;
        drw.fadeOut(700, function() {
            con.show();
            drw.empty();
        });
    });
	$(btn2d).click(function(){
        $(this).toggleClass('down');
        $(btn3d).prop('class','togglebutton');
    });
    $(btn3d).click(function(){
        $(this).toggleClass('down');
        $(btn2d).prop('class','togglebutton');
    });
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