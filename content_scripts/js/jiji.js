var html = `<span class="techspecs-model jiji">
				<div id='c'>
	  				<div class='s'></div>
	  				<div class="techspecs-product-wrapper">
						<iframe class='techspecs_iframe' src='`+chrome.runtime.getURL('popups/jiji.html')+`'></iframe>
				   </div>
				</div>
				
			</span>`;

var userName = '';
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
	var checkMobilePage = setInterval(()=>{
		if($(".b-breadcrumb-wrapper").find("a[href='/mobile-phones']").length > 0){
			clearInterval(checkMobilePage);			
			if(!processing){
				processing = true;	

				//Scrap jiji Product Name
				productName = $.trim($('.b-advert-seller-info-wrapper .b-advert-title-inner').text());
				if(jijiStaticProduct){
					productName = jijiStaticProductName;
				}
				
				//Scrap jiji Product Description
				productDesription = productName;
				
				//Create reference url
				userName = '';
				itemUrl = window.location.href.replace('https://www.','');
				powered_by_ref_url = baseUrl+"/powered-by/?ts_username="+userName+"&source=jiji.ng&url="+itemUrl;
									
				chrome.runtime.sendMessage({from:'content_script',action:'get_ext_object'},function(response){
					ex_id = response.ex_id;
					ex_token = response.ex_token;
					searchProductApi(productName.replace('*','').replace('+','plus'), productDesription);
				});
			}
		}		
	},100);
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
					$(".b-advert-seller-info-wrapper .b-advert-title-inner").after(html);
					deviceId = response.result[0].device_id;
					//getProductDetailsById(deviceId);
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