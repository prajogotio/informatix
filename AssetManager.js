//Asset Management
function AssetManager(){
	this.downloadQueue = [];
	this.downloaded = 0;
	this.skipped = 0;
	this.cache = {};
}

AssetManager.prototype.pushAsset = function(path){
	this.downloadQueue.push(path);
}

AssetManager.prototype.isDone = function(){
	return (this.downloaded + this.skipped === this.downloadQueue.length) ;
}


AssetManager.prototype.downloadAll = function(downloadCallback){
	var that = this;

	var length = this.downloadQueue.length;
	if(length === 0) {
		this.downloadCallback();
		return;
	}

	for(var i = 0; i < length; i++){

		var path = this.downloadQueue[i];
		var img = new Image();

		img.addEventListener("load", function(e){
			that.downloaded += 1;
			if(that.isDone()){
				that.downloadCallback();
			}
		}, false);

		img.addEventListener("error", function(e){
			that.skipped += 1;
			if(that.isDone()){
				that.downloadCallback();
			}
		}, false);

		img.src = path;
		this.cache[path] = img;
	}
}

AssetManager.prototype.getAsset = function(path){
	return this.cache[path];
}

AssetManager.prototype.downloadCallback = function() {};
