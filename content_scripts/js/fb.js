var html = `<span class="techspecs-model">
				<div id='c'>
	  				<div class='s'></div>
	  				<div class="techspecs-product-wrapper">
						<iframe class='techspecs_iframe' src='`+chrome.runtime.getURL('popups/fb.html')+`'></iframe>
				   </div>
				</div>
				
			</span>`;

var fbName = '';
var itemUrl = '';
var processing = false;
var powered_by_ref_url = '';
var ex_id = null;
var ex_token = null;

var productName;
var productDesription;
var deviceId;
var productData = {
	deviceId:0
};

$(document).ready(function () {
	 $(document).on("click","._7yc._3ogd",function() {
		var findModel = setInterval(function () {
			productModel = $('[aria-labelledby="marketplace-modal-dialog-title"] span[data-testid="marketplace_pdp_title"]').length;
			if (productModel > 0) {
				clearInterval(findModel);
				if(!processing){
					processing = true;	

					//Scrap FB Product Name
					productName = $('[aria-labelledby="marketplace-modal-dialog-title"] #marketplace-modal-dialog-title').attr('title');			
					
					//Scrap FB Product Description
					productDesription = $.trim($('div[aria-labelledby="marketplace-modal-dialog-title"]').find('p._4etw span').text());
					
					//Scrap FB Product Category
					var cat = $.trim($('[aria-labelledby="marketplace-modal-dialog-title"] #marketplace-modal-dialog-title').prev().find('div[data-hover="tooltip"]').text());

					//Create reference url
					fbName = $.trim($('[data-click="profile_icon"]').text());
					itemUrl = window.location.href.replace('https://www.','');
					powered_by_ref_url = baseUrl+"/powered-by/?ts_username="+fbName+"&source=facebook.com&url="+itemUrl;
										
					if(categories.indexOf(cat) >= 0 || disableCategories){
						chrome.runtime.sendMessage({from:'content_script',action:'get_ext_object'},function(response){
							ex_id = response.ex_id;
							ex_token = response.ex_token;
							searchProductApi(productName.replace('*','').replace('+','plus'), productDesription);
						});						
					} else {
						processing = false;
					}
				}
			} 
		},500);  
    });
});

function searchProductApi(productName, productDesription = "") {
	var url = apiBaseUrl + "/extension_search_desc_title";
	processing = false;

    $.ajax({
		url: url,
		type: 'POST',
		beforeSend: function (xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer '+ex_token);
		},
		data: {text:productName,desc:productDesription},
        success: function (response) {
			if (response.result != undefined && response.result.length > 0) {	    
				if($(".techspecs-model").length == 0){
					
					$('[aria-labelledby="marketplace-modal-dialog-title"] #marketplace-modal-dialog-title').append(html);
					$('[aria-labelledby="marketplace-modal-dialog-title"] #marketplace-modal-dialog-title').attr('title','');
					
					distance = $(window).width() - ($('#c').offset().left + $('#c').width());
					if(distance < 360){
						$(".techspecs_iframe").css('margin-left','-355px');
					}
					deviceId = response.result[0].device_id;
					getProductDetailsById(deviceId);
				}			
			}
        },
        error: function (error) { 
			console.log(error);
		},
    });
}

function getProductDetailsById(deviceId) {
	$.ajax({
	    type: "GET",
	    url: apiBaseUrl + "/product/detail/"+deviceId+'/1',
	    dataType: 'json'
	}).done(function(response) {	
		productData.deviceId = deviceId;
		productData.response = response;
		chrome.runtime.sendMessage({'type':'product_detail','response':response, 'powered_by_ref_url':powered_by_ref_url});
	});
}

function resetProductModel() {
	chrome.runtime.sendMessage({'type':'show_loader'});		
	getProductDetailsById(deviceId);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {	
	if(request.from == "bg" && request.action == "set_ext_object"){		
		ex_id = request.ex_id;
		ex_token = request.ex_token;
	} else if(request.from == "bg" && request.action == "focus_changed"){
		var checkMobilePage = setInterval(()=>{
			if($(".techspecs-model").length > 0){
				clearInterval(checkMobilePage);
				console.log(deviceId);
				console.log(productData);
				if(productData.deviceId == deviceId){
					chrome.runtime.sendMessage({'type':'product_detail','response':productData.response, 'powered_by_ref_url':powered_by_ref_url});
				} else {
					chrome.runtime.sendMessage({from:'content_script',action:'get_ext_object'},function(response){
						ex_id = response.ex_id;
						ex_token = response.ex_token;
						resetProductModel();
					});
				}
			}
		})		
	}
});