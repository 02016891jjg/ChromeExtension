var html = `<div class="yt-techspecs-product-wrapper"><iframe class='techspecs_iframe' src='`+chrome.runtime.getURL('popups/yt.html')+`'></iframe></div>`;

var processing = false;
var powered_by_ref_url = '';
var deviceId;
var videoId;
var productData = {
	videoId:0
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {		
	if(request.from == "bg" && request.action == "focus_changed"){
		//GET YOUTUBE VIDEO ID
		videoId = window.location.search.split('&')[0].split("?v=")[1];
		if($(".yt-techspecs-product-wrapper").length > 0){
			if(productData.videoId == videoId){
				chrome.runtime.sendMessage({'type':'product_detail','response':productData.response, 'powered_by_ref_url':"javascript:void(0)", 'active_url':window.location.href});
			} else {
				chrome.runtime.sendMessage({'type':'show_loader'});
				$(".yt-techspecs-product-wrapper").show();
				searchProductByVideo(videoId);
			}
		} else {
			searchProductByVideo(videoId);
		}
	}
});

function searchProductByVideo(videoId='') {
	var url = apiBaseUrl + "/productsByYoutube";
	$.ajax({
	    type: "POST",
	    url: url,
		data: {youtube_url:videoId}
	}).done(function(response) {
		processing = false;		
	    if (response != undefined && response.length > 0) {
			deviceId = response[0];
			getProductDetailsByDeviceId(response[0]);			
	    } else {
			$(".yt-techspecs-product-wrapper").remove();
		}
	});
}

function getProductDetailsByDeviceId(deviceId) {	
	if($(".yt-techspecs-product-wrapper").length == 0){
		$("#secondary").prepend(html);
	}
	$.ajax({
	    type: "GET",
		url: apiBaseUrl + "/product/detail/"+deviceId+'/1',
	    dataType: 'json'
	}).done(function(response) {
		productData.videoId = videoId;
		productData.response = response;
		$(".yt-techspecs-product-wrapper").show();		
		chrome.runtime.sendMessage({'type':'product_detail','response':response, 'powered_by_ref_url':"javascript:void(0)", 'active_url':window.location.href});		
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {	
	if(request.from == "bg" && request.action == "set_ext_object"){		
		ex_id = request.ex_id;
		ex_token = request.ex_token;
	}
});