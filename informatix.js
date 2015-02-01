var assetManager;
var URL = {
}

function assetManagerPopulateServiceAssets() {
	assetManager.downloadAll();
}

function downloadCallback() {
	startService();
}

function assetManagerPopulateUserAssets() {
}

function renderFromJSON(metadata) {
	setupCSS();
	var backbone = new BackboneDivision();
	backbone.setBackgroundColor(metadata["background-color"] || 'white');
	for(var i = 0; i < metadata["contents"].length; ++i) {
		var current = metadata["contents"][i];
		var content = new ContentDivision(current["height"] || '800px');
		var img = new Image();
		img.src = current["static"]["src"];
		content.setStaticContent(new StaticContentDivision(img, current["static"]["width"]));

		if(current["dynamic"]) {
			content.setDynamicContent(getDynamicContent(current["dynamic"], current["height"].match(/\d+/i)[0]));
		}

		backbone.appendChild(content);
	}
	document.body.appendChild(backbone.self);
}

function getDynamicContent(metadata, height) {
	var ret;
	var width = window.innerWidth;
	if(metadata["type"] == "squarish-theme") {
		ret = new SquarishThemeBackground(width, height, metadata["color"]);
	}
	if(metadata["type"] == "video") {
		var video = createVideoElement(metadata["src"], metadata["src-type"]);
		ret = new VideoThemeBackground(width, height, video);
	}
	if(metadata["type"] == "sign-theme"){
		if(metadata["src"]) {
			// custom sign
		} else {
			ret = new SignThemeBackground(width, height, YellowDotSign, 50, 50, 120, 120);
		}
	};
	return ret;
}

function startService() {
	renderFromJSON(webPageMetadata);
}

document.addEventListener("DOMContentLoaded", function() {
	assetManager = new AssetManager();
	assetManager.downloadCallback = downloadCallback;
	assetManagerPopulateUserAssets();
	assetManagerPopulateServiceAssets();

})


function setupCSS() {
	document.body.style.setProperty('margin', '0');
}
/*
 * @param elem : DOM Element
 * @param width : string "px", "%"
 */
function setWidth(elem, width) {
	elem.style.setProperty('width', width);
}

/*
 * @param elem : DOM Element
 * @param height : string "px", "%"
 */
function setHeight(elem, height) {
	elem.style.setProperty('height', height);
}

/*
 * @param elem : DOM Element
 */
function setDimensionPacked(elem) {
	elem.style.setProperty('display', 'inline-block');
}

/*
 * @param elem : DOM Element
 */
function removeSelfFromParent(elem) {
	elem.parentElement.removeChild(elem);
}

/*
 * @param elem: DOM Element
 */
function setZIndex(elem, z) {
	elem.style.setProperty('z-index', z);
}

function setStyle(elem, style, value) {
	elem.style.setProperty(style, value);
}

function setTransform(elem, transform) {
	elem.style.setProperty('transform', transform);
	elem.style.setProperty('-moz-transform', transform);
	elem.style.setProperty('-webkit-transform', transform);

}

function calculateAbsoluteOffsetTop(elem){
	var offsetTop = 0;
	while (elem) {
		offsetTop += elem.offsetTop;
		elem = elem.offsetParent;
	}
	return offsetTop;
}

function createVideoElement(src, type) {
	var videoElem = document.createElement('video');
	videoElem.setAttribute('autoplay', 'autoplay');
	var videoSource = document.createElement('source');
	videoSource.src = src;
	videoSource.type = 'video/' + type;
	videoElem.appendChild(videoSource);
	return videoElem;
}


/*
 * @class Division
 */
function Division() {
	this.self = document.createElement('div');
	setWidth(this.self, "100%");	
	setStyle(this.self, 'position', 'relative');
	setStyle(this.self, 'margin', '0');
	setStyle(this.self, 'padding', '0');
	//this.setDimensionPacked();
	this.children = [];
}

Division.prototype.setDimensionPacked = function() {
	setDimensionPacked(this.self);
}

/*
 * @param child : Division
 */
Division.prototype.appendChild = function(child) {
	this.children.push(child);
	this.self.appendChild(child.self);
}

Division.prototype.setBackgroundColor = function(color) {
	setStyle(this.self, 'background-color', color);
}


/*
 * @class BackboneDivision
 */
function BackboneDivision() {
	Division.call(this);
}

BackboneDivision.prototype = Object.create(Division.prototype);






/*
 * @class ContentDivision
 */ 
function ContentDivision(height) {
	Division.call(this);
	setHeight(this.self, height);
}

ContentDivision.prototype = Object.create(Division.prototype);

/*
 * @param staticContent : Division
 */
ContentDivision.prototype.setStaticContent = function(staticContent) {
	if(this.staticContentDivision != null) {
		removeSelfFromParent(this.staticContentDivision.self);
		this.children.splice(this.children.indexOf(this.staticContentDivision), 1);
	}
	this.staticContentDivision = staticContent;
	this.appendChild(staticContent);
	setZIndex(staticContent.self, '2');
}

/*
 * @param dynamicContent : Division
 */
ContentDivision.prototype.setDynamicContent = function(dynamicContent) {
	if(this.dynamicContentDivision != null) {
		removeSelfFromParent(this.dynamicContentDivision.self);
		this.children.splice(this.children.indexOf(this.dynamicContentDivision), 1);
	}
	this.dynamicContentDivision = dynamicContent;
	this.appendChild(dynamicContent);
	setZIndex(dynamicContent.self, '1');
}

ContentDivision.prototype.setMargin = function(top, bottom) {
	setStyle(this.self, 'margin-top', top);
	setStyle(this.self, 'margin-bottom', bottom);

}

/*
 * @class StaticContentDivision
 */
function StaticContentDivision(image, width) {
	Division.call(this);
	this.appendImage(image);
	setStyle(this.self, 'position', 'absolute');
	setStyle(this.self, 'margin', 'auto');
	setStyle(this.self, 'left', '0');
	setStyle(this.self, 'right', '0');
	setStyle(this.self, 'width', width);
	setStyle(this.self, 'top', '50%');
	setTransform(this.self, 'translateY(-50%)');
}

StaticContentDivision.prototype = Object.create(Division.prototype);

/*
 * @param image : Image
 */
StaticContentDivision.prototype.appendImage = function(image) {
	this.children.push(image);
	this.self.appendChild(image);
	setStyle(image, 'width', '100%');
}


/*
 * @class DynamicContentDivison
 */

function DynamicContentDivison(width, height) {
	Division.call(this);
	this.width = width;
	this.height = height;
	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute('width', width);
	this.canvas.setAttribute('height', height);
	setStyle(this.canvas, 'width', '100%');
	setStyle(this.canvas, 'height', '100%');
	this.self.appendChild(this.canvas);
	this.g = this.canvas.getContext('2d');
}

DynamicContentDivison.prototype = Object.create(Division.prototype);


/*
 * @class StatsThemeBackground
 */

function SignThemeBackground(width, height, signType, signWidth, signHeight, spaceWidth, spaceHeight) {
	DynamicContentDivison.call(this, width, height);
	window.addEventListener('scroll', this, false);
	setStyle(this.self, 'overflow', 'hidden');
	this.signList = [];
	var SignType = signType;
	for(var i=0;i<this.width/spaceWidth;++i){
		for(var j=0;j<this.height/spaceHeight*3;++j){
			this.signList.push(new SignType(i * spaceWidth, j * spaceHeight - this.height, signWidth, signHeight, 'UP', this));
		}
	}
	for(var i=0;i<this.width/spaceWidth;++i){
		for(var j=0;j<this.height/spaceHeight*3;++j){
			this.signList.push(new SignType(i * spaceWidth + spaceWidth/2, j * spaceHeight + spaceHeight/2 - this.height, signWidth, signHeight, 'DOWN', this));
		}
	}
	for(var i=0;i<this.signList.length;++i) this.signList[i].render(this.g);
}

SignThemeBackground.prototype = Object.create(DynamicContentDivison.prototype);

SignThemeBackground.prototype.handleEvent = function(e) {
	var cur = window.pageYOffset;
	for(var i=0;i<this.signList.length;++i) this.signList[i].update(cur);
	this.g.clearRect(0, 0, this.width, this.height);
	for(var i=0;i<this.signList.length;++i) this.signList[i].render(this.g);
}

function Sign(left, top, width, height, direction, parent) {
	this.parent = parent;
	this.initTop = top;
	this.initLeft = left;
	this.left = left;
	this.top = top;
	this.width = width;
	this.height = height;
	this.direction = direction;
	this.speed = 1;
}

Sign.prototype.update = function(val) {
	this.lastPosition = calculateAbsoluteOffsetTop(this.parent.self);
	if(this.direction == 'UP') {
		this.top  = this.initTop + (this.lastPosition - val) * (this.speed);
	}
	else if(this.direction == 'DOWN') {
		this.top  = this.initTop - (this.lastPosition - val) * (this.speed+0.4);
	}
}

Sign.prototype.render = function(g) {
	g.save();
	g.translate(this.left, this.top);
	g.drawImage(this.img, -this.width/2, -this.height/2, this.width, this.height);
	g.restore();
}

function CustomSign(left, top, width, height, direction, parent) {
	Sign.call(this, left, top, width, height, direction, parent);
	this.img = this.parent.customSign;
}

CustomSign.prototype = Object.create(Sign.prototype);

function GreenDotSign(left, top, width, height, direction, parent) {
	Sign.call(this, left, top, width, height, direction, parent);
	color = "green";
	radius = "10";
	this.cache = document.createElement('canvas');
	this.cache.setAttribute('width', 50);
	this.cache.setAttribute('height', 50);
	var g = this.cache.getContext('2d');
	g.beginPath();
	g.fillStyle = color;
	g.arc(25, 25, radius, 0, 2*Math.PI, false);
	g.fill();
	this.img = this.cache;
}

GreenDotSign.prototype = Object.create(Sign.prototype);

function YellowDotSign(left, top, width, height, direction, parent) {
	Sign.call(this, left, top, width, height, direction, parent);
	color = "yellow";
	radius = "10";
	this.cache = document.createElement('canvas');
	this.cache.setAttribute('width', 50);
	this.cache.setAttribute('height', 50);
	var g = this.cache.getContext('2d');
	g.beginPath();
	g.fillStyle = color;
	g.arc(25, 25, radius, 0, 2*Math.PI, false);
	g.fill();
	this.img = this.cache;
}

YellowDotSign.prototype = Object.create(Sign.prototype);





function SquarishThemeBackground(width, height, color) {
	DynamicContentDivison.call(this, width, height);
	this.color = color;
	this.squareList = [];
	var that = this;
	this.squarishLoop = setInterval(function() {
		that.update();
		that.render();
	}, 1000/60);
}

SquarishThemeBackground.prototype = Object.create(DynamicContentDivison.prototype);

SquarishThemeBackground.prototype.update = function() {
	if(this.squareList.length < 30 && Math.random() > 0.3) this.squareList.push(new RotationalSquare(Math.random() * this.width, Math.random() * this.height, this.color));
	var temp = [];
	for (var i = 0; i < this.squareList.length; ++i) {
		this.squareList[i].update();
		if(this.squareList[i].delta < 1) temp.push(this.squareList[i]);
	}
	this.squareList = temp;
}

SquarishThemeBackground.prototype.render = function() {
	this.g.clearRect(0,0, this.width, this.height);
	for (var i = 0; i < this.squareList.length; ++i) {
		this.squareList[i].render(this.g);
	}
}

function RotationalSquare(left, top, color) {
	this.color = color;
	this.left = left;
	this.top = top;
	this.delta = 0;
	this.length = Math.random() * 70 + 10;
	this.orientation = Math.random() * 360;
	this.bubbleSpeed = Math.random() * 3.2;
	this.deltaSpeed = Math.random()/110;
	this.rotationSpeed = Math.random() * 2.6;
	this.direction = (Math.random() > 0.5 ? 'CW' : 'CCW');
}

RotationalSquare.prototype.update = function() {
	this.delta += this.deltaSpeed;
	this.top -= this.bubbleSpeed;
	if(this.direction=='CW')this.orientation += this.rotationSpeed;
	else this.orientation -= this.rotationSpeed;
}

RotationalSquare.prototype.render = function(g) {
	if(this.delta>1)return;
	g.save();
	g.translate(this.left, this.top);
	g.rotate(this.orientation/180 * Math.PI);
	g.strokeStyle = this.color;
	g.globalAlpha = 1.0 - this.delta;
	g.strokeRect(-this.length/2, -this.length/2, this.length, this.length);
	g.restore();
}

function VideoThemeBackground(width, height, video) {
	DynamicContentDivison.call(this, width, height);
	removeSelfFromParent(this.canvas);
	this.video = video;
	this.video.muted = true;
	this.video.loop = true;
	setStyle(this.video, 'width', '100%');
	setStyle(this.video, 'height', '100%');
	setStyle(this.video, 'position', 'relative');
	setStyle(this.self, 'overflow', 'hidden');
	this.self.appendChild(video);

	window.addEventListener('scroll', this, false);
}

VideoThemeBackground.prototype = Object.create(DynamicContentDivison.prototype);

VideoThemeBackground.prototype.handleEvent = function(e) {
	var thisPosition = calculateAbsoluteOffsetTop(this.self);
	var newTop =(window.pageYOffset - thisPosition) * 0.6;
	setStyle(this.video, 'top', newTop + 'px');
}