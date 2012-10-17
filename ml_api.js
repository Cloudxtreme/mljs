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
    var video = document.createElement('video');
    var jqvideo = $(video);
    jqvideo.css({'width':'100%','height':'100%'});
    jqvideo.hide();
    video.src = "http://www.mediacollege.com/video/format/mpeg4/videofilename.mp4";
    video.controls = true;
    tile.append(jqvideo);
    tile.css_props = {'backgroundColor':'#FF0000','border-radius':'15px','width':'100','height':'100'};
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
            jqvideo.show();
            tile.animate({'width':'500px', 'height':'500px'}, 250, function() {
                video.play();
            });
            tile.view_mode++;
        }
        else if(tile.view_mode === 2) {
            // Stop playing and go back to thumbnail mode
            tile.animate(tile.css_props, 250, function() {
                video.load();
                jqvideo.hide();
            });
            tile.view_mode = 0;
        }
    });
    return tile;
};
