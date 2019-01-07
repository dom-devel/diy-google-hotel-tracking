// Debug mode
artoo.settings.debug = true;

function artoo_scrape() {
	/* This function runs the artoo extract data and returns an array
  of all the data  extracted.

  Returns: An array
  */
	// Fixed values
	keyword_query = $(".Ax4B8 .whsOnd").val();
	start_date = $(".hh3Grb .yJ5hSd:first-child .Py5Hke").text();
	end_date = $(".hh3Grb .yJ5hSd:last-child .Py5Hke").text();
	number_of_guests = $(".aZ7Hdb .DEh1R .sjSjZ").text();
	price_low = $(".OjHNpb .S0qFgf > div:nth-child(2) .zE2DFd").text();
	price_high = $(".OjHNpb .S0qFgf > div:nth-child(3) .zE2DFd").text();

	counter = 1;

	var artoo_list = artoo.scrape(".YcV5bd .uaTTDe", {
		name: {
			sel: ".Nj1rKd",
			method: "text"
		},
		review_score: {
			sel: ".KFi5wf",
			method: "text"
		},
		review_number: {
			sel: ".jdzyld",
			method: "text"
		},
		hotel_stars: {
			sel: ".aQIPt > span:last-child",
			method: "text"
		},
		description: {
			sel: ".utmxZ",
			method: "text"
		},
		price_final: {
			sel: ".Dhct3d",
			method: function($) {
				return get_stand_alone_price($(this));
			}
		},
		price_original: {
			sel: ".PFxd8c",
			method: "text"
		},
		price_deal: {
			sel: ".pGe5Ub, .aqGO9b",
			method: "text"
		},
		rank: function($) {
			return counter++;
		},
		keyword: function($) {
			return keyword_query;
		},
		start_date: function($) {
			return start_date;
		},
		end_date: function($) {
			return end_date;
		},
		price_low: function($) {
			return price_low;
		},
		price_high: function($) {
			return price_high;
		},
		number_of_guests: function($) {
			return number_of_guests;
		},
		date: function($) {
			return Date();
		}
	});

	// Trim all whitespace for strings
	artoo_list.forEach(function(value, index, artoo_list) {
		Object.keys(artoo_list[index]).forEach(function(nest_key, nest_index) {
			if (isString(artoo_list[index][nest_key])) {
				artoo_list[index][nest_key] = artoo_list[index][
					nest_key
				].trim();
			}
		});
	});

	return artoo_list;
}

function get_stand_alone_price(list_of_elements) {
	/* Takes a hotels price box and returns the price without deal.

  Returns: A price with currency.
  */

	if (list_of_elements.length === 0) {
		return "No price";
	} else {
		price_box = list_of_elements[0];

		deal_1_identifier = $(price_box).find(".PFxd8c").length;
		deal_2_identifier = $(price_box).find(".pGe5Ub").length;

		if (deal_1_identifier || deal_2_identifier) {
			price = $(price_box).find(".fgVCDb")[0].textContent;
		} else {
			price = price_box.textContent;
		}

		return price;
	}
}

function store_list_in_local_storage(storage_key, list_to_store) {
	/* This function takes a list, and an artoo storage key.

  It stores the contents of the list into the array stored at the artoo storage key.
  
  Returns: Nothing.
  */

	artoo_keys = artoo.store.keys();

	if (artoo_keys.includes(storage_key)) {
		list_to_store.forEach(function(value, key, list_to_store) {
			artoo.store.pushTo(storage_key, value);
		});
	} else {
		artoo.store.set(storage_key, list_to_store);
	}
}

function run_function_on_field_list_in_artoo(
	artoo_list,
	key_list,
	data_function
) {
	/* This function takes an artoo list (i.e. a list of objects), a list
	of keys and a data function. The data function will be run on 
	every key in the list of keys and overwrite the value with the output
	of the function.

	Returns: An altered list of objects
	*/
	artoo_list.forEach(function(value, index, artoo_list) {
		Object.keys(artoo_list[index]).forEach(function(nest_key, nest_index) {
			if (key_list.includes(nest_key)) {
				artoo_list[index][nest_key] = data_function(
					artoo_list[index][nest_key]
				);
			}
		});
	});

	return artoo_list;
}

function run_regex_extract_on_list_of_artoo_fields_and_save_to_object(
	artoo_extract_list,
	regex,
	specific_field
) {
	/* Takes an artoo list (list of objects) and runs a regex against 
	a specific field in it. Any captured groups returned will be saved as
	properties of the nested objects.
  
  Returns: A list of objects.
  */
	artoo_extract_list.forEach(function(value, key, artoo_extract_list) {
		named_groups = value.specific_field.match(regex).groups;

		for (var group in named_groups) {
			value[group] = named_groups[group];
		}
	});

	return artoo_extract_list;
}

function extract_only_numbers_from_string(input_str) {
	/*Extracts the number from a string. 

	Returns: A float*/
	if (isString(input_str)) {
		output = input_str.replace(/[^0-9\.]+/g, "");
		return parseFloat(output);
	} else {
		console.log("A non-string was fed to extract numbers from str func.");
		return input_str;
	}
}

function extract_and_store_in_local_storage(artoo_key) {
	console.log("Scrape beginning");
	var counter = 1;
	// Scrape all the information from the page
	hotels_list = artoo_scrape();

	// Add date to artoo list NBED

	scrape_success = true;
	// Useful logging output.
	if (!Array.isArray(hotels_list) || !hotels_list.length) {
		console.log("Artoo has failed to scrape or found nothing.");
		scrape_success = false;
	} else {
		console.log(
			"Artoo has successfully scraped {} items from the page.".format(
				hotels_list.length
			)
		);
	}

	// Loop through and run any necessary data altering
	// Convert price to a number
	run_function_on_field_list_in_artoo(
		hotels_list,
		["review_number"],
		extract_only_numbers_from_string
	);
	console.log("Data manipulations successfully run.");

	if (scrape_success) {
		// Store the scrape into local storage
		store_list_in_local_storage(artoo_key, hotels_list);
		console.log("Items have been successfully saved in storage");

		// Get total size of list
		length = get_total_object_in_storage(artoo_key);
		console.log("Total storage size is {}".format(length));

		// Set message output.
		if (length) {
			message = "Artoo found {} items. There are currently {} total in the store.".format(
				hotels_list.length,
				length
			);
		} else {
			message = "Artoo found {} items. However none saved.".format(
				hotels_list.length,
				length
			);
		}
	} else {
		message = "Artoo failed to scrape from the page.";
	}

	return message;
}

function download_key_to_csv(artoo_key) {
	/* Takes an artoo key and outputs to the browser as JSON.
  */
	data = artoo.store(artoo_key);
	artoo.saveCsv(data);
}

function clear_scrape_store() {
	/* Clear everything stored by artoo*/
	artoo.store.removeAll();
}

function get_total_object_in_storage(artoo_key) {
	/* Retries an object from storage and counts the number of elements.
  */

	object = artoo.store(artoo_key);

	return object.length;
}

(function($, undefined) {
	artoo.stylesheets["bookmark.css"] =
		".container{background:#fff;border:2px solid #000;position:absolute;top:50px;right:50px;z-index:9999999;padding:20px;max-width:250px}li.button{cursor:pointer;justify-content:center;padding-bottom:calc(.375em - 1px);padding-left:.75em;padding-right:.75em;padding-top:calc(.375em - 1px);text-align:center;white-space:nowrap;background-color:#00d1b2;color:#fff;-webkit-appearance:none;align-items:center;border:1px solid transparent;border-radius:4px;box-shadow:none;font-size:1rem;height:2.25em;position:relative;vertical-align:top;display:flex;margin-bottom:10px}li.button:last-child{margin-bottom:0}ul{padding-inline-start:0}a,div,li,p,ul{font-size:14px;font-family:sans-serif}";
	template =
		'<div class="container"><h2>Info</h2><div>Message:<span id="message-box"></span></div><p>This bookmarklet scrapes Google Hotels results and dumps them into Google storage. Scrape as many as you would like, then click download to get the JSON for them.</p><h2>Actions</h2><div class="button-container"><ul><li id="action-run-scape" class="button">Run scrape</li><li id="action-download" class="button">Download scrape store as CSV</li><li id="action-clear" class="button">Clear scrape store</li></ul></div></div>';

	artoo_key = "hotels_storage";

	// Create artoo UI
	var ui = new artoo.ui();

	// Set-up widget
	ui.injectStyle("bookmark.css");
	ui.$().append(template);

	// Attach click hook for running
	ui.$("#action-run-scape").on("click", function() {
		message = extract_and_store_in_local_storage(artoo_key);
		ui.$("#message-box").html(message);
	});

	// Attach click hook for downloading
	ui.$("#action-download").on("click", function() {
		download_key_to_csv(artoo_key);
	});

	// Attach click hook for deleting
	ui.$("#action-clear").on("click", function() {
		clear_scrape_store();
		ui.$("#message-box").html("Storage has been cleared");
	});
}.call(this, artoo.$));

// Utility functions

function isString(x) {
	return Object.prototype.toString.call(x) === "[object String]";
}

String.prototype.format = function() {
	/* A Javascript equivalent of pythons format function.*/
	var i = 0,
		args = arguments;
	return this.replace(/{}/g, function() {
		return typeof args[i] != "undefined" ? args[i++] : "";
	});
};
