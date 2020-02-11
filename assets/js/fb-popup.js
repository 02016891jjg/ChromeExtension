chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {	
	console.log(msg);
	
	if(msg.type == "show_loader"){
		$(".tabs").hide();
		$("#loader").show();
	} else if(msg.type == "product_detail"){
		$('.product_data tbody').html('');
		var response = msg.response;
		$("#powered_by_ref_url").attr('href',msg.powered_by_ref_url);
		$("#product_name").text(response.result.name);
		
	    var specification = response.result.specification;
	    var productAttributes = '';
		
		$.each(specification, function (section_title, data) {
		    $.each(data,function (attr_key,attr_value) {
		    	
		    	productAttributes += '<tr><td>'+attr_key+'</td>';
		    
			    if(Array.isArray(attr_value.value)){
					productAttributes += '<td>';
					attr_value.value.forEach(function(item, i) {
						productAttributes += '<div class="color-box" ><span class="colors" style="background:'+item.code+'"></span><br>'+item.color_name+'</div>';
					});
					productAttributes += '</td>';
			    }else{
	   			    productAttributes +=  '<td>'+attr_value.value+'</td>';
			    }
			    productAttributes += '</tr>';
		    })
		});
		
		$('.product_data tbody').html(productAttributes);
		$(".tabs").hide();
		$("#tab1").show();
		
	}	    
});