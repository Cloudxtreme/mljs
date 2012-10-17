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
    var tile = $(document.createElement('div'));
    tile.css_props = {'position':'static','margin':'5px','float':'left','backgroundColor':'#FF0000','border-radius':'15px','width':'100','height':'100'};
    tile.css(tile.css_props);
    tile.view_mode = 0; // 0 = inactive, 1 = thumbnail, 2 = playing
    tile.click(function() {
        if(tile.view_mode === 0) {
            // First click, show thumbnail/slideshow
            tile.animate({'backgroundColor':'#5CFF5F'}, 500);
            tile.view_mode++;
        }
        else if(tile.view_mode === 1) {
            // User has clicked the tile again, time to play the video
            show_video_overlay(tile);
            
            tile.view_mode++;
        }
    });
    return tile;
};

var show_video_overlay = function(tile) {
    tile.overlay = $(document.createElement('div'));
            tile.overlay.css({'clear':'both','position':'fixed','backgroundColor':'#FF0000','border-radius':'15px'});
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
