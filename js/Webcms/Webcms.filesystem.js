/* WebcmsFilesystem */
function WebcmsFilesystem(context) {

	this.context = context;
	this.path = new String();
	this.uploadUrl = new String();
	this.url = new String();
	this.newDirectoryTitle = new String();
	this.newDirectoryUrl = new String();

	this.init();
};

WebcmsFilesystem.prototype = {
	selffs: null,
	init: function() {
		// defaults values
		selffs = this;

		this.__registerListeners();
	},
	setPath: function(path) {
		this.path = path;
	},
	getPath: function(path) {
		return this.path;
	},
	setUploadUrl: function(url) {
		this.uploadUrl = url;
	},

	setUrl: function(url) {
		this.url = url;
	},
	setNewDirectoryTitle: function(title) {
		this.newDirectoryTitle = title;
	},
	setNewDirectoryUrl: function(url) {
		this.newDirectoryUrl = url;
	},

	progressHandlingFunction: function(e) {
	    if(e.lengthComputable){
	    	var percentage = Math.round((e.loaded / e.totalSize) * 100, 2);
	    	var totalSize = Math.round(e.totalSize / 1024 / 1024);
	    	var uploaded = Math.round(e.loaded / 1024 / 1024);

	    	$("#totalSize").html(totalSize + "Mb");
	    	$("#uploaded").html(uploaded + "Mb");
	    	$("#progress").css({"width": percentage + "%"});
	    }
	},

	onComplete: function() {
		console.log('done');
		$("#uploadStatus").hide();
		$.nette.ajax({ url : selffs.url, data : { path : selffs.path } });
	},

	__registerListeners: function() {

		$(document).on('click', '.filesDialog', function(e) {
			e.preventDefault();

			$(document).off('click', '.jq_file');

			var options = {
				container: $(this).data('container'),
				containerId: $(this).data('container-id')
			};

			$(document).on('click', '.jq_filesAdd',  function(e) {
				e.preventDefault();

				$('.jq_selected:checked').each(function() {

					var single = $(this).attr('type') == 'radio' ? true : false;

					var data = $(this).data();
					var id = parseInt($('input:radio:last').val()) + 1;
					
					if (isNaN(id)) {
						id = 1;
					}
					
					if (!single) {
						$(options.container).append('<div class="col-md-3 jq_fileBox"><div class="img-thumbnail"><img src="' + data.thumbnail + '" /><input type="hidden" name="files[]" value="' + data.path + '" /><input class="form-control" type="text" name="fileNames[]" placeholder="Název souboru" /><input class="form-control" type="radio" name="fileDefault[]" value="' + id + '" /><span class="btn btn-default jq_fileDelete">&times</span></div></div>');
					} else {
						$(options.container).html('<div class="col-md-3 jq_fileBox"><div class="img-thumbnail"><img src="' + data.thumbnail + '" /><input id="filePath" type="hidden" name="files[]" value="' + data.path + '" /><input class="form-control" type="text" name="fileNames[]" placeholder="Název souboru" /><input class="form-control" type="radio" name="fileDefault[]" value="' + id + '" /><span class="btn btn-default jq_fileDelete">&times</span></div></div>');
					}

					$(this).attr('checked', false);
				});
			});
		});

		$(document).on('click', '.jq_fileDelete', function(e) {
			e.preventDefault();

			$(this).closest('.jq_fileBox').remove();
		});

		$(document).on('submit', '#filesystemForm', function(e){
			e.preventDefault();
			$("#uploadStatus").show();

			var formData = new FormData($('#filesystemForm')[0]);
			$.ajax({
		        url: selffs.uploadUrl + '&path=' + selffs.path,  //Server script to process data
		        type: 'POST',
		        xhr: function() {  // Custom XMLHttpRequest
		            var myXhr = $.ajaxSettings.xhr();
		            if(myXhr.upload){ // Check if upload property exists
		                myXhr.upload.addEventListener('progress', selffs.progressHandlingFunction, false); 
		            }
		            return myXhr;
		        },
		        //Ajax events
		        success: selffs.onComplete,
		        error: function(e) {
		        	console.log(e);
		        },
		        // Form data
		        data: formData,
		        //Options to tell jQuery not to process data or worry about content-type.
		        cache: false,
		        contentType: false,
		        processData: false
		    });
		});

		$(document).on('click', '.dir',function(){

			selffs.setPath($(this).data('path'));
			console.log(selffs.path);
		});

		$(document).on('click', '.jq_newDir', function(e){
			e.preventDefault();
			
			bootbox.prompt(selffs.newDirectoryTitle, function(text){
				if(text) {
					$.nette.ajax({ url : selffs.newDirectoryUrl, data : { name : text, path: selffs.path } })
				}
			});
		});
	}
};
