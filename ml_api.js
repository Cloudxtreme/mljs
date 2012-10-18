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
    var border_overlay = $(document.createElement('div'));
    var thumb_strip_container = $(document.createElement('div'));
    var thumb_strip = $(document.createElement('img'));
    var play_button = $(document.createElement('div'));
    
    // Set styles
    var bordered_style = {'border-radius':'15px','overflow':'hidden','width':tile_size.width,'height':tile_size.height};
    border_overlay.css(bordered_style);
    border_overlay.css({'position':'absolute','z-index':'1','box-shadow':'-5px 5px 10px #EDEDED inset,5px -5px 10px #EDEDED inset'});
    thumb_strip_container.css(bordered_style);
    thumb_strip_container.css({'z-index':'0','float':'left'});
    tile.css(bordered_style);
    tile.css({'margin':'5px','float':'left','cursor':'pointer','box-shadow':'-5px 5px 10px #888'});
    thumb_strip.css({'width':'607px','height':'100'});
    play_button.css({'background':'url(images/play.png) no-repeat center center','position':'absolute','z-index':'3', 'width':tile_size.width, 'height':tile_size.height});
    
    // Set other properties
    //thumb_strip.get(0).src = 'http://thumbs.motherlessmedia.com/thumbs/08000F-strip.jpg';
    thumb_strip.get(0).src = 'http://www.miqel.com/images_1/fractal_math_patterns/wada-reflection-basin/dcp_challenge_wada.jpg';
    tile.view_mode = 0; // 0 = inactive, 1 = thumbnail, 2 = playing
    tile.click(function() {
        if(tile.view_mode === 0) {
            // First click, show thumbnail/slideshow
            tile.animate({'borderTopColor':'#FFD726','borderLeftColor':'#FFD726','borderRightColor':'#FFD726','borderBottomColor':'#FFD726','border-width':'3px'}, 500, function() {
                tile.append(play_button);
            });
            tile.view_mode++;
        }
        else if(tile.view_mode === 1) {
            // User has clicked the tile again, time to play the video
            show_video_overlay(tile);
            tile.view_mode++;
        }
    });

    // Build the tile
    thumb_strip_container.append(thumb_strip);
    tile.append(thumb_strip_container);
    tile.append(border_overlay);
    
    return tile;
};

/**
 * Displays the video overlay for the specified tile
 * @param tile the tile the overlay cooresponds to
 */
var show_video_overlay = function(tile) {
    tile.overlay = $(document.createElement('div'));
    tile.overlay.css({'clear':'both','position':'fixed','z-index':'4','backgroundColor':'#FF0000','border-radius':'15px'});
    tile.overlay.click(function() {
        // Stop playing and go back to thumbnail mode
        tile.overlay.animate(tile.css_props, 250, function() {
            tile.animate(tile.css_props, 250);
        });
        tile.overlay.remove();
        tile.overlay = undefined;
        tile.view_mode = 0;
    });
    var video = document.createElement('video');
    var jqvideo = $(video);
    jqvideo.css({'width':'100%','height':'100%'});
    video.src = "http://www.mediacollege.com/video/format/mpeg4/videofilename.mp4";
    video.controls = true;
    tile.overlay.append(video);
    jqvideo.show();
    tile.overlay.show();
    $(document.body).append(tile.overlay);
    tile.overlay.animate({'left':'5px','top':'5px','right':'5px','bottom':'5px'}, 250, function() {
        video.play();
    });
};
