// ml_api.js
// Interfaces with www.motherless.com
// Whired

// Videos that have been loaded already
var current_videos = new Array();

// Video load callbacks
var loaded_videos_callbacks = new Array();

// Tags that indicate a taboo
var taboo_tags = {
	'scat':['toilet','shit','poop','piss','pee','dump','crap','scat','diarrhea','turd','enema','puk','vomit','diaper','constipat'],
	'gore':['gore','death','kill','snuff','dead','murder','stab','blood','bleeding','gun','beat','fight'],
	'gay':['gay','homo','fag','queer','twink','shemale','tran','trap'],
	'beast':['beast','animal','dog','horse'],
	'dom':['whip','spank','punish','slave','tortur','bdsm','bondage','sadi','rape','humili']
};

// Checks for taboo indicated by the specified tile
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

// Attempts to load live videos from motherless
var load_live_videos = function(){
	// There a few reasons to ignore this request
	if(!videos_are_loading && !load_timeout && loaded_videos_callbacks.length > 0) {
		videos_are_loading = true;
		console.log('Loading new videos..');
		$.ajax({
			type: 'GET', 
			url: 'http://motherless.com/live/videos',
			dataType: 'html',
			success: function(data) {
				load_timeout = setTimeout(load_timeout_callback, 15000);
				var new_videos = new Array();
				$(data).find('div.thumbnail.mediatype_video').each(function() {
					var video_link = $(this).children('div.thumbnail-img-wrap').children('a').get(0);
					
					if(current_videos.indexOf(video_link.rel) == -1) {
						var meta_wrapper = $(this).children('div.thumbnail-meta');
						var video = {};
						var b_u = 'http://motherless.com/'; // The base url
						video.author = meta_wrapper.children('div.thumbnail-info.left.ellipsis').not('.small').text().trim();
						video.author_url = b_u+'u/'+video.author;
						video.length = meta_wrapper.children('div.thumbnail-info.right.ellipsis').not('.small').text().trim();
						video.id = video_link.rel;
						video.url = b_u+'view/frame?item='+video.id;
						video.full_url = b_u+video.id;
						video.title = video_link.title;
						video.thumbnail_url = 'http://thumbs.motherlessmedia.com/thumbs/'+video.id+'-strip.jpg';
						video.taboo =  get_taboo_tag(video.title);
						
						console.log(video.title+' | '+video.author+' | '+video.length);
						current_videos.push(video.id);
						new_videos.push(video);
					}
				});
				
				videos_are_loading = false;
				
				// Let our callbacks know we're done
				if(new_videos.length > 0 && loaded_videos_callbacks.length > 0) {
					$(loaded_videos_callbacks).each(function() {
						this(new_videos);
					});
				}
				
				// There still might be some extra screen real estate
				load_by_scroll();
			}
		});
	}
	else if(load_timeout) {
		reload_after_timeout = true;
	}
};

// Uhhhhhh doc?
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