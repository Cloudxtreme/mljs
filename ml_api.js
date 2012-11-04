/** The current thumb cycle interval */
var current_preview_tile;

/** An array of the videos currently on the page */
var current_videos = new Array();

/**
 * Creates the video overlay for the selected video
 */
var create_video_overlay = function() {
	var overlay = $('#video_overlay');
	overlay.click(function() {
		$('#video_frame').prop('src','');
        overlay.fadeOut(700, function() {
            clear_preview(current_preview_tile);
        });
	});
	return overlay;
};
var video_overlay;

/**
 * Creates the div that represents a video
 */
var create_video_tile = function(video) {
    
	// Make sure this video isn't added again!
	current_videos.push(video.id);
	
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
	var found_taboo = get_taboo_tag(tile.video.title);
    if(found_taboo) {
		tile.icon_overlay = $(document.createElement('div'));
		tile.icon_overlay.prop('title','tagged as '+found_taboo).css({'background':'url(images/'+found_taboo+'.png) no-repeat center center','width':'24px','height':'24px','position':'absolute','right':'10px','top':'8px','z-index':'3'})
		.appendTo(tile.border_overlay);
	}
	
    return tile.get(0);
};
/** Taboo! */
var taboo_tags = {
	'scat':['toilet','shit','poop','piss','pee','dump','crap','scat','diarrhea','turd','enema','puk','vomit','diaper','constipat'],
	'gore':['gore','death','kill','snuff','dead','murder','stab','blood','bleeding','gun','beat','fight'],
	'gay':['gay','homo','fag','queer','twink','shemale','tran','trap'],
	'beast':['beast','animal','dog','horse'],
	'dom':['whip','spank','punish','slave','tortur','bdsm','bondage','sadi','rape','humili']
};

/**
 *	Checks to see whether or not a video title indicates taboo
 * @param title the title to check
 */
var get_taboo_tag = function(title) {
	var found;
	$.each(taboo_tags, function(key, value) {
		$(this).each(function() {
			if(title.toLowerCase().indexOf(this.toString()) > -1) {
				found = key;
				return false;
			}
		});
		if(found) {
			return false;
		}	
	});
	return found;
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
	// Still want to cycle immediatly
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

/**
 * Loads live videos from motherless
 */
var load_live_videos = function(){
	// If this is already happening, abort
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
				$(data).find('div.thumbnail.mediatype_video').each(function() {
					var video_link = $(this).children('div.thumbnail-img-wrap').children('a').get(0);
					if(current_videos.indexOf(video_link.rel) == -1) {
						var meta_wrapper = $(this).children('div.thumbnail-meta');
						var video = {};
						video.author = meta_wrapper.children('div.thumbnail-info.left.ellipsis').not('.small').text().trim();
						video.length = meta_wrapper.children('div.thumbnail-info.right.ellipsis').not('.small').text().trim();
						video.id = video_link.rel;
						video.url = 'http://motherless.com/view/frame?item='+video.id;
						video.full_url = 'http://motherless.com/'+video.id;
						video.title = video_link.title;
						video.thumbnail_url = 'http://thumbs.motherlessmedia.com/thumbs/'+video.id+'-strip.jpg';
						console.log(video.title+' | '+video.author+' | '+video.length);
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

	// TODO Needs to hide content way out of view
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
	load_live_videos();
});