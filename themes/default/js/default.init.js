$(function(){
    
    //favorites system
	$('.add-favorite, .remove-favorite').click(function(event) {
		  event.preventDefault();
		  $this = $(this);
		  $.ajax({ url: $this.attr('href'),
				}).done(function ( data ) {

                    //favorites counter
                    countname = 'count'+$this.data('id');
                    if(document.getElementById(countname))
                    {
                        currentvalue = parseInt($('#'+countname).html(),10);
                        if($('#'+$this.data('id')+' a').hasClass('add-favorite remove-favorite'))
                            $('#'+countname).html(currentvalue-1);
                        else
                            $('#'+countname).html(currentvalue+1);
                    }
                    
					$('#'+$this.data('id')+' a').toggleClass('add-favorite remove-favorite');
					$('#'+$this.data('id')+' a i').toggleClass('glyphicon-heart-empty glyphicon-heart');
				});
	});

});

$(function(){

    //notification system
    var favicon = new Favico({
        animation : 'popFade'
    });

    $('#contact-notification').click(function(event) {
        $.get($(this).data('url'));
        $(document).mouseup(function (e)
        {
            var contact = $("#contact-notification");
        
            if (!contact.is(e.target) // if the target of the click isn't the container...
                && contact.has(e.target).length === 0) // ... nor a descendant of the container
            {
                //$("#contact-notification").slideUp();
                $("#contact-notification span").hide();
                $("#contact-notification i").removeClass('fa-bell').addClass('fa-bell-o');
                $("#contact-notification-dd" ).remove();
                favicon.badge(0);
            }
        });
    });
    
    //intial value
    favicon.badge($('#contact-notification span').text());
});

//validate auth pages
$(function(){
    
    $.validator.addMethod(
        "emaildomain",
        function(value, element, domains) {
            if (domains.length === 0)
                return true;

            for (var i = 0; i < domains.length; i++) {
                if (value.indexOf(("@" + domains[i]), value.length - ("@" + domains[i]).length) !== -1) {
                    return true;
                }
            }

            return false;
        }
    );

    $.validator.addMethod(
        "nobannedwords",
        function(value, element, words) {
            if (words.length === 0)
                return true;

            for (var i = 0; i < words.length; i++) {
                if (value.indexOf(words[i]) !== -1) {
                    return false;
                }
            }

            return true;
        }
    );

    var $params = {rules:{}, messages:{}};
    $params['rules']['email'] = {required: true, email: true};

    $(".auth").each(function() {
        $(this).validate($params)
    });

    var $register_params = {rules:{}, messages:{}};
    $register_params['rules']['email'] = {required: true, email: true, emaildomain: $('.register :input[name="email"]').data('domain')};
    $register_params['rules']['password1'] = {required: true};
    $register_params['rules']['password2'] = {required: true};
    $register_params['messages']['email'] = {"emaildomain" : $('.register :input[name="email"]').data('error')};
    $register_params['rules']['captcha'] = {"remote" : {url: $(".register").attr('action'),
                                                        type: "post",
                                                        data: {ajaxValidateCaptcha: true}}};
    $register_params['messages']['captcha'] = {"remote" : $('.register :input[name="captcha"]').data('error')};

    $(".register").each(function() {
        $(this).validate($register_params)
    });
    
});

function createCookie(name,value,seconds) {
    if (seconds) {
        var date = new Date();
        date.setTime(date.getTime()+(seconds*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function initAutoLocate() {
    if ($('input[name="auto_locate"]').length) {
        jQuery.ajax({
            url: ("https:" == document.location.protocol ? "https:" : "http:") + "//cdn.jsdelivr.net/gmaps/0.4.15/gmaps.min.js",
            dataType: "script",
            cache: true
        }).done(function() {
            autoLocate();
        });
    }
}

function autoLocate() {
    $('#auto-locations').on('show.bs.modal', function () {
        $('.modal .modal-body').css('overflow-y', 'auto'); 
        $('.modal .modal-body').css('max-height', $(window).height() * 0.8);
    });

    $('#auto-locations').modal('show');

    if ( ! readCookie('cancel_auto_locate') && ( ! readCookie('mylat') || ! readCookie('mylng'))) {
        var lat;
        var lng;
        GMaps.geolocate({
            success: function(position) {
                lat = position.coords.latitude;
                lng = position.coords.longitude
                // 30 minutes cookie
                createCookie('mylat',lat,1800);
                createCookie('mylng',lng,1800);
                // show modal
                $.get($('meta[name="application-name"]').data('baseurl'), function(data) {
                    $('input[name="auto_locate"]').after($(data).find("#auto-locations"));
                    $('#auto-locations').modal('show');
                    $('#auto-locations .list-group-item').click(function(event) {
                        event.preventDefault();
                        $this = $(this);
                        $.post($('meta[name="application-name"]').data('baseurl'), {
                            user_location: $this.data('id')
                        })
                        .done(function( data ) {
                            window.location.href = $this.attr('href');
                        });
                    });
                })
            },
            error: function(error) {
                console.log('Geolocation failed: '+error.message);
                createCookie('cancel_auto_locate',1,1800);
            },
            not_supported: function() {
                console.log("Your browser does not support geolocation");
                createCookie('cancel_auto_locate',1,1800);
            },
        });
    }
}

$(function(){
    $('#auto-locations .list-group-item').click(function(event) {
        event.preventDefault();
        $this = $(this);
        $.post($('meta[name="application-name"]').data('baseurl'), {
            user_location: $this.data('id')
        })
        .done(function( data ) {
            window.location.href = $this.attr('href');
        });
    });

    $('#auto-locations .close').click( function(){
        createCookie('cancel_auto_locate',1,1800);
    });

    setInterval(function () {
        if ( ! navigator.onLine )
            $('.off-line').show();
        else
            $('.off-line').hide();
    }, 250);
});

$(function(){
    // Check for LocalStorage support.
    if (localStorage && $('#Widget_RecentlySearched')) {
        $('.Widget_RecentlySearched').hide();
        var recentSearches = [];

        if (localStorage["recentSearches"]) {
            $('.Widget_RecentlySearched').show();
            recentSearches = JSON.parse(localStorage['recentSearches']);

            var list = $('ul#Widget_RecentlySearched')

            $.each(recentSearches, function(i) {

                values = JSON.parse(this);
                var text = '';

                $.each(values, function(j) {
                    if (jQuery.type(this) === 'string' && this != '' && this != values.serialize)
                        text = text + this + ' - ';
                })

                text = text.slice(0,-3)

                var li = $('<li/>')
                    .appendTo(list);
                var a = $('<a/>')
                    .attr('href', $('#Widget_RecentlySearched').data('url') + '?' + values.serialize)
                    .text(text)
                    .appendTo(li);
            })
        }

        form = 'form[action*="' + $('#Widget_RecentlySearched').data('url') + '"]';

        // Add an event listener for form submissions
        $(form).on('submit', function() {

            var $inputs = $(this).find(':input:not(:button):not(:checkbox):not(:radio)');
            var values = {};

            $inputs.each(function() {
                if (this.name) {
                    values[this.name] = $(this).val();
                }
            });

            values['serialize'] = $(this).serialize();

            values = JSON.stringify(values);

            recentSearches.unshift(values);
            if (recentSearches.length > $('#Widget_RecentlySearched').data('max-items')) { 
                recentSearches.pop();
            }

            localStorage['recentSearches'] = JSON.stringify(recentSearches);
        });

    }
});

function getlocale() {
    var siteCurrency = $('.curry').data('default');
    if(siteCurrency != undefined && siteCurrency != ''){
        return siteCurrency;
    } else {
        switch($('.curry').data('locale')){
            case 'en_US':
                siteCurrency = 'USD';
                break;
            case 'en_UK':
                siteCurrency = 'GBP';
                break;
            case 'ar':
                siteCurrency = 'AED';
                break;
            case 'bg_BG':
                siteCurrency = 'BGN';
                break;
            case 'bn_BD':
                siteCurrency = 'BDT';
                break;
            case 'ca_ES':
                siteCurrency = 'EUR';
                break;
            case 'cs_CZ':
                siteCurrency = 'CZK';
                break;
            case 'da_DK':
                siteCurrency = 'DKK';
                break;
            case 'de_DE':
                siteCurrency = 'EUR';
                break;
            case 'el_GR':
                siteCurrency = 'EUR';
                break;
            case 'en_UK':
                siteCurrency = 'GBP';
                break;
            case 'es_ES':
                siteCurrency = 'EUR';
                break;
            case 'fr_FR':
                siteCurrency = 'EUR';
                break;
            case 'hi_IN':
                siteCurrency = 'INR';
                break;
            case 'hr_HR':
                siteCurrency = 'HRK';
                break;
            case 'hu_HU':
                siteCurrency = 'HUF';
                break;
            case 'in_ID':
                siteCurrency = 'IDR';
                break;
            case 'it_IT':
                siteCurrency = 'EUR';
                break;
            case 'ja_JP':
                siteCurrency = 'JPY';
                break;
            case 'ml_IN':
                siteCurrency = 'INR';
                break;
            case 'nl_NL':
                siteCurrency = 'EUR';
                break;
            case 'no_NO':
                siteCurrency = 'NOK';
                break;
            case 'pl_PL':
                siteCurrency = 'PLN';
                break;
            case 'pt_PT':
                siteCurrency = 'EUR';
                break;
            case 'ro_RO':
                siteCurrency = 'RON';
                break;
            case 'ru_RU':
                siteCurrency = 'RUB';
                break;
            case 'sk_SK':
                siteCurrency = 'EUR';
                break;
            case 'sn_ZW':
                siteCurrency = 'USD';// ZWD not available
                break;
            case 'sq_AL':
                siteCurrency = 'ALL';
                break;
            case 'sr_RS':
                siteCurrency = 'RSD';
                break;
            case 'sv_SE':
                siteCurrency = 'SEK';
                break;
            case 'ta_IN':
                siteCurrency = 'INR';
                break;
            case 'tl_PH':
                siteCurrency = 'PHP';
                break;
            case 'tr':
                siteCurrency = 'TRY';
                break;
            case 'ur_PK':
                siteCurrency = 'PKR';
                break;
            case 'vi_VN':
                siteCurrency = 'VND';
                break;
            case 'zh_CN':
                siteCurrency = 'CNY';
                break;
            default:
                siteCurrency = 'USD';
                break;
        }
        return siteCurrency;
    }
}

function getSiteCurrency() {
    return getlocale();
}

function getSavedCurrency() {
    siteCurrency = getlocale();
    savedCurrency = getCookie('site_currency');

    if (savedCurrency == undefined) {
        return siteCurrency;
    }
    
    return savedCurrency;
}

// Currency converter
$(function(){
    var savedRate, savedCurrency, siteCurrency;
    siteCurrency = getSiteCurrency();
    savedCurrency = getSavedCurrency();
    if (getCookie('site_currency') == undefined) {
        savedRate = 1;
        savedCurrency = siteCurrency;
    }
    else {
        savedRate = getCookie('site_rate');
        savedCurrency = getCookie('site_currency');
        rate = parseFloat(savedRate);
        var prices = $('.price-curry'), money;
        prices.each(function(){
            money = $(this).text();
            money = Number(money.replace(/[^0-9\.]+/g, ''));
            converted = rate * money;
            var symbols = ({
              'USD': '&#36;',
              'AUD': '&#36;',
              'CAD': '&#36;',
              'MXN': '&#36;',
              'BRL': '&#36;',
              'GBP': '&pound;',
              'EUR': '&euro;',
              'JPY': '&yen;',
              'INR': '&#8377;',
              'BDT': '&#2547;',
              'PHP': '&#8369;',
              'VND': '&#8363;',
              'CNY': '&#165;',
              'UAH': '&#8372;',
              'HKD': '&#36;',
              'SGD': '&#36;',
              'TWD': '&#36;',
              'THB': '&#3647;',
            });
            converted = Number(converted.toString().match(/^\d+(?:\.\d{2})?/));
            symbol = symbols[savedCurrency] || savedCurrency;
            $(this).text($(this).html(symbol + ' ' + converted).text());
        });
     }

    $(function(){
        if ($('.curry').length){
            $('.my-future-ddm').curry({
                change: true,
                target: '.price-curry',
                base: savedCurrency == undefined ? siteCurrency : savedCurrency,
                symbols: {}
            }).change(function(){
                var selected = $(this).find(':selected'), // get selected currency
                currency = selected.val(); // get currency name
          
                getRate(siteCurrency, currency);
                setCookie('site_currency', currency, { expires: 7, path: '' });
            });
        }
    });
});

function getRate(from, to) {
    var script = document.createElement('script');
    script.setAttribute('src', "https://query.yahooapis.com/v1/public/yql?q=select%20rate%2Cname%20from%20csv%20where%20url%3D'http%3A%2F%2Fdownload.finance.yahoo.com%2Fd%2Fquotes%3Fs%3D"+from+to+"%253DX%26f%3Dl1n'%20and%20columns%3D'rate%2Cname'&format=json&callback=parseExchangeRate");
    document.body.appendChild(script);
}

function parseExchangeRate(data) {
    var name = data.query.results.row.name;
    var rate = parseFloat(data.query.results.row.rate, 10);
    setCookie('site_rate', rate, { expires: 7, path: '' });
}

function setCookie(c_name,value,exdays)
{
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays==null) ? "" : ";path=/; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
}
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}


$('.modal').on('hidden.bs.modal', function (e) {
    if($('.modal').hasClass('in')) {
    $('body').addClass('modal-open');
    }    
});
