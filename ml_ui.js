// ml_ui.js
// Contains the code for building the UI
// Whired

// The currently previewed tile
var current_preview_tile;

// Whether or not the user is browsing a single author
var author_mode;

// Target size for tiles
var tile_size = {width:'121px',height:'130px',margin:'5px'};

// The amount of rows that have been scrolled down
var scrolled_rows = 0;

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

    // TODO Remove hardcode, implement scaling!
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
			tile.border_overlay.css({'background-position-x':parseInt(tile_size.width)});
			cycle_thumbs(tile);
        }
        else if(tile.view_mode === 1) {
            // User has clicked the tile again, time to play the video
            clear_preview();
			$('#video_frame').attr('src','http://motherless.com/view/frame?item='+tile.video.id).load($('#video_overlay').fadeIn(700));
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
                        var con = $('#content');
                        con.empty();
                        $(cbv).each(function() {
                            con.append(create_video_tile(this));
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

// Cycles through the thumbs for the specified tile
var cycle_thumbs = function(tile) {
	clear_preview();
	// Used for cycling immediatly
	var cycle = function() {
        var t_wid = parseInt(tile_size.width);
		if(tile.thumb_strip.left_offset < tile.thumb_strip.width()-t_wid*2) {
			
            tile.thumb_strip.left_offset += t_wid;
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
var clear_preview = function() {
	if(current_preview_tile) {
		clearInterval(current_preview_tile.interval);
		current_preview_tile.view_mode = 0;
		current_preview_tile.border_overlay.css(current_preview_tile.border_overlay.border_css, 1000);
        current_preview_tile = null;
	}
};

// The timeout for recalculating row/col counts
var resize_timeout;

// The tile row count
var tile_row_count;

// The tile column count
var tile_col_count;

// The videos that have been loaded
var loaded_videos = [];

// Closes the video overlay
var close_overlay = function() {
    $('#video_frame').prop('src','');
    $('#video_overlay').fadeOut(700, function() {
        clear_preview(current_preview_tile);
    });
};

// Resets the entire grid and displays it again
var display_video_tiles = function() {
    $('#content').empty();
    var start_index = scrolled_rows*tile_col_count;
    var end_index = start_index+tile_row_count*tile_col_count;
    if(end_index < loaded_videos.length) {
        for (var i = start_index; i < end_index; i++) {
            $('#content').append(create_video_tile(loaded_videos[i]));
        }
    }
    else {
        console.log('end_index: '+end_index+' loaded_videos.length: '+loaded_videos.length);
        // grab more
        load_live_videos(add_loaded);
        load_live_videos(function(videos) {
            display_video_tiles();
        });
    }
    console.log('display_video_tiles() - start:0 end:'+end_index);
};

// Displays the next row of videos
var display_next_videos = function() {
    if(!author_mode) {
        var start_index = tile_row_count*tile_col_count+scrolled_rows*tile_col_count;
        var end_index = start_index+tile_col_count;
        
        if(end_index < loaded_videos.length) {
            for (var i = start_index; i < end_index; i++) {
                $('#content').append(create_video_tile(loaded_videos[i]));
            }
            scrolled_rows++;
            console.log('Displayed video '+start_index+' through '+end_index+', '+(loaded_videos.length-end_index)+' videos left');
            $('#content > div:lt('+tile_col_count+')').remove();
        }
        else {
            console.log('Out of videos!');
        }

        // See if we need to fetch more
        if(loaded_videos.length-end_index < tile_col_count*10) {
            console.log(loaded_videos.length-end_index+'<'+tile_col_count*8+', Loading more videos in the background..');
            load_live_videos(add_loaded);
        }
    }
    else {
        console.log('In author mode, not loading more videos!');
    }
};

// Displays the previous row of videos
var display_previous_videos = function() {
    if(scrolled_rows > 0) {
        scrolled_rows--;
        var start_index = scrolled_rows*tile_col_count;
        var end_index = start_index+tile_col_count;
        for(var i = end_index-1; i >= start_index; i--) {
            $('#content').prepend(create_video_tile(loaded_videos[i]));
        }
        $('#content > div:gt('+(tile_row_count*tile_col_count)+')').remove(); // This might not be the best place!
        console.log('display_previous_videos() - start:'+start_index+' end:'+end_index);
    }
};

var tile_margins = parseInt(tile_size.margin)*2;

// Recalculate tile row/col counts
var recalculate_counts = function() {
    var con = $('#content');
    tile_col_count = Math.floor(con.parent().width()/(parseInt(tile_size.width)+tile_margins));
    tile_row_count = Math.ceil(con.parent().height()/(parseInt(tile_size.height)+tile_margins));
    con.css({'width':(tile_col_count*(parseInt(tile_size.width)+tile_margins))+'px'});
    display_video_tiles();
};

var add_loaded = function(videos) {
    $(videos).each(function() {
        loaded_videos.push(this);
    });
};

// Things to do when the app is done loading
$(document).ready(function() {
	// Initialize UI
    var con = $('#content');

    recalculate_counts();

    $(document).mousewheel(function(e,d) {
        if(d > 0) { // Wheel up
            display_previous_videos();
        }
        else { // Wheel down
            display_next_videos();
        }
    });
    $(document).keyup(function(e) {
        if(e.which === 38) { // Up
            display_previous_videos();
        }
        else if(e.which === 40) { // Down
            display_next_videos();
        }
        else if(e.which == 27) { // Esc
            if(author_mode) {
                author_mode = false;
                display_video_tiles();
            }
            else if($('video_overlay').is(':visible')) {
                console.log('Closing overlay..');
                close_overlay();
            }
        }
    });
    $(window).resize(function() {
        // Set the timeout
        if(resize_timeout) {
            clearTimeout(resize_timeout);
        }
        resize_timeout = setTimeout(function() {
            recalculate_counts();
        }, 1500);
    });
	$('#btn2d').click(function(){
        $(this).toggleClass('down');
        $('#btn3d').prop('class','togglebutton');
    });
    $('#btn3d').click(function(){
        $(this).toggleClass('down');
        $('#btn2d').prop('class','togglebutton');
    });
	$('#video_overlay').click(function() {
		close_overlay();
	});
    
    // Finally, show some videos
    display_video_tiles();
});