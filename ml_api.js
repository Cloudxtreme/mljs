// ml_api.js
// Interfaces with www.motherless.com
// Whired

// Videos that have been loaded already
var current_videos = [];

// Video load callbacks
var loaded_videos_callbacks = [];

// Tags that indicate a taboo
var taboo_tags = {
	'scat':['toilet','shit','poop','piss','pee','dump','crap','scat','diarrhea','turd','enema','puk','vomit','diaper','constipat','fart'],
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
var load_live_videos = function(on_load){
	// Add the call back
	if(on_load && loaded_videos_callbacks.indexOf(on_load) == -1) { // This should stop duplicates..
		loaded_videos_callbacks.push(on_load);
        console.log('Currently '+loaded_videos_callbacks.length+' callbacks');
	}
    else {
        console.log('Ignoring duplicate callback');
    }
	
	// There a few reasons to ignore this request
	if(!videos_are_loading && !load_timeout && loaded_videos_callbacks.length > 0) {
		videos_are_loading = true;
		console.log('Loading new videos..');
		$.ajax({
			type: 'GET', 
			url: 'http://motherless.com/live/videos',
			dataType: 'html',
			success: function(data) {
				load_timeout = setTimeout(load_timeout_callback, 16000);
				var new_videos = parse_videos(data);
				if(new_videos.length > 0) { // New videos aren't guaranteed
					$(new_videos).each(function() {
						current_videos.push(this.id);
					});
					
                    console.log('There are '+current_videos.length+' videos loaded.');
                    
					// Let our callbacks know we're done
					if(new_videos.length > 0 && loaded_videos_callbacks.length > 0) {
						$(loaded_videos_callbacks).each(function() {
							this(new_videos);
						});
						loaded_videos_callbacks = []; // Clear them out
						videos_are_loading = false;
					}
				}
				else {
					console.log('No new videos found, retrying!');
					videos_are_loading = false;
					setTimeout(load_live_videos, 5000);
				}
			}
		});
	}
	else if(load_timeout) {
		reload_after_timeout = true;
	}
};

// Loads a user's videos
var load_user_videos = function(user,callback) {
	$.ajax({
		type: 'GET', 
		url: 'http://motherless.com/u/'+user+'?t=v',
		dataType: 'html',
		success: function(data) {
			var new_videos = parse_videos(data);
			if(new_videos.length > 0) {
				callback(new_videos);
			}
		}
	});
};

// Parses video objects from the specified source
var parse_videos = function(src) {
	var new_videos = [];
	var new_videos_ids = [];
	$(src).find('div.thumb.video.medium').each(function() {
		var video_link = $(this).find('a.img-container').get(0);
		var id = video_link.href.substring(video_link.href.lastIndexOf('/')+1);
		if(current_videos.indexOf(id) == -1 && new_videos_ids.indexOf(id) == -1) {
			var meta_wrapper = $(this).find('div.captions');
			var video = {};
			var b_u = 'http://motherless.com/';
			video.author = meta_wrapper.find('a.caption.left').text().trim();
			video.author_url = b_u+'u/'+video.author;
			video.length = meta_wrapper.find('div.caption.left').text().trim();
			video.id = id;
			video.url = b_u+'view/frame?item='+video.id;
			video.full_url = b_u+video.id;
			video.title = $(video_link).find('img.static').get(0).alt;
			video.thumbnail_url = 'http://thumbs.motherlessmedia.com/thumbs/'+video.id+'-strip.jpg';
			video.taboo =  get_taboo_tag(video.title);
			
			new_videos.push(video);
			new_videos_ids.push(video.id);
		}
	});
	return new_videos;
};

// TODO doc
var load_timeout;
var reload_after_timeout;
var videos_are_loading;
var load_timeout_callback = function() {
	clearTimeout(load_timeout);
	load_timeout = null;
	if(reload_after_timeout) {
		load_live_videos();
		reload_after_timeout = false;
	}
};