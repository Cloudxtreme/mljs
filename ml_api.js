/**
 * Adds a video to the page with the specified thumbnails
 * @param thumbs_arr the array of urls of the thumbnail images
 * @param vid_url the url of the video
 */
var add_video = function(thumbs_arr, vid_url) {
};

/**
 * Creates the div that represents a video
 */
var create_video_tile = function() {
    
    // The target size of the file
    var tile_size = {width:'121px', height:'100px'};
    
    // Create the elements
    var tile = $(document.createElement('div'));
    tile.border_overlay = $(document.createElement('div'));
    var thumb_strip_container = $(document.createElement('div'));
    tile.thumb_strip = $(document.createElement('img'));
    tile.thumb_strip.left_offset = 0;
    tile.play_button = $(document.createElement('div'));
    
    // Set styles
    var bordered_style = {'border-radius':'15px','overflow':'hidden','width':tile_size.width,'height':tile_size.height};
    tile.border_overlay.css(bordered_style);
    tile.border_overlay.border_css = {'position':'absolute','z-index':'1','box-shadow':'0px 0px 25px 5px rgba(237,237,237,.5) inset'};
    tile.border_overlay.css(tile.border_overlay.border_css);
    thumb_strip_container.css(bordered_style);
    thumb_strip_container.css({'z-index':'0','float':'left'});
    tile.css(bordered_style);
    tile.css({'margin':'5px','float':'left','cursor':'pointer','box-shadow':'-5px 5px 10px rgba(237,237,237,.5)'});
    tile.thumb_strip.css({'width':'607px','height':'100'});
    tile.play_button.css({'background':'url(images/play.png) no-repeat center center','position':'absolute','z-index':'3', 'width':tile_size.width, 'height':tile_size.height});
    
    // Set other properties
    tile.thumb_strip.get(0).src = 'http://thumbs.motherlessmedia.com/thumbs/08000F-strip.jpg';
    tile.view_mode = 0; // 0 = inactive, 1 = thumbnail, 2 = playing
    tile.click(function() {
        if(tile.view_mode === 0) {
            // First click, show thumbnail/slideshow
            tile.border_overlay.animate({'box-shadow':'0px 0px 25px 5px rgba(252,217,61,.5) inset'}, 1000);
            tile.append(tile.play_button);
            cycle_thumbs(tile);
            tile.view_mode++;
        }
        else if(tile.view_mode === 1) {
            // User has clicked the tile again, time to play the video
            clearInterval(currentInterval);
            show_video_overlay(tile);
            tile.view_mode++;
        }
    });

    // Build the tile
    thumb_strip_container.append(tile.thumb_strip);
    tile.append(thumb_strip_container);
    tile.append(tile.border_overlay);
    
    return tile;
};

/**
 * Displays the video overlay for the specified tile
 * @param tile the tile the overlay cooresponds to
 */
var show_video_overlay = function(tile) {
    tile.overlay = $(document.createElement('div'));
    tile.overlay.css({'clear':'both','position':'fixed','z-index':'4','backgroundColor':'#FF0000','border-radius':'15px','left':'5px','top':'5px','right':'5px','bottom':'5px','display':'none'});
    tile.overlay.click(function() {
        // Stop playing and go back to thumbnail mode
        tile.overlay.fadeOut(700, function() {
            tile.overlay.remove();
            tile.overlay = undefined;
            tile.view_mode = 0;
            tile.border_overlay.animate(tile.border_overlay.border_css, 1000);
            tile.play_button.remove();
        });
    });
    var video = $(document.createElement('video'));
    video.css({'width':'100%','height':'100%'});
    video.get(0).src = "http://www.mediacollege.com/video/format/mpeg4/videofilename.mp4";
    video.get(0).controls = true;
    tile.overlay.append(video);
    $(document.body).append(tile.overlay);
    tile.overlay.fadeIn(700, function() {
        video.get(0).play();
    });
};

/** The current thumb cycle interval */
var currentInterval;

/**
 * Cycles through the thumbs for a tile
 * @param tile the tile to cycle
 */
var cycle_thumbs = function(tile) {
    currentInterval = setInterval(function() {
        if(tile.thumb_strip.left_offset < tile.thumb_strip.width()-242) {
            tile.thumb_strip.left_offset += 121;
            tile.thumb_strip.get(0).style.marginLeft = -tile.thumb_strip.left_offset+'px';
        }
        else {
            tile.thumb_strip.get(0).style.marginLeft = '0px';
            tile.thumb_strip.left_offset = 0;
        }
    }, 1500);
};

var get_live_videos = function(){
    $.ajax({
        type: 'GET', 
        url: 'http://motherless.com/live',
        dataType: 'html',
        success: function(data) {
            console.log('success!');
            console.log($(data).find('.thumbnail mediatype_video'));
        },
        error:function (xhr, options, error){
            alert(xhr.status+': '+error);
        }
    });
};