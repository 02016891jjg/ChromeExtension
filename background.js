var ex_id = chrome.runtime.id;
var TOKEN = null;
var PASSWORD = '';

chrome.runtime.onInstalled.addListener(function() {
	registerExtension();	
	setInterval(()=>{
		getToken();
	},TOKEN_EXPIRATION*60*1000);		
});

chrome.runtime.onStartup.addListener(function() {
	registerExtension();	
	setInterval(()=>{
		getToken();
	},TOKEN_EXPIRATION*60*1000);		
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {	
	if(request.from == "content_script" && request.action == "get_ext_object"){
		sendResponse({from:'bg',action:'set_ext_object',ex_id:ex_id,ex_token:TOKEN});
	}
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	console.log('On page Activated');
	chrome.tabs.sendMessage(activeInfo.tabId, {from:'bg', action:'focus_changed'});  
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status === "complete"){
		console.log('On page completed');
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {from:'bg', action:'focus_changed'});
        });
	}  
});

function getToken(){
	$.ajax({
        type: "POST",
       	url: apiBaseUrl+"/getExtensionToken",
        data: {id:ex_id, password:PASSWORD }
    }).done(function(response) {
		console.log(response);
		TOKEN = response.token;
    });
}

function registerExtension(){		
	var data = {id:ex_id, password:PASSWORD, type: "extension" };
	$.ajax({
		type: "POST",
		url: apiBaseUrl+"/extension_register",
		data: data
	}).done(function(response) {
		console.log(response);
		if(response.error){
			getToken();
		} else {
			TOKEN = response.token;
		}
	});
}