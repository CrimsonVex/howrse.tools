var proxyJsonp="getTopGP.php";
jQuery.ajaxOrig = jQuery.ajax;
jQuery.ajax = function(a, b) {
   function d(a) {
      a = encodeURI(a).replace(/&/g, "%26");
      a = a.replace('https://', '');
      return proxyJsonp + "?url=" + a + "&callback=?"
   }
   var c = "object" === typeof a ? a : b || {};
   c.url = c.url || ("string" === typeof a ? a : "");
   var c = jQuery.ajaxSetup({}, c),
      e = function(a, c) {
         var b = document.createElement("a");
         b.href = a;
         return c.crossOrigin && "http" == a.substr(0, 4).toLowerCase() && "localhost" != b.hostname && "127.0.0.1" != b.hostname && b.hostname != window.location.hostname
      }(c.url, c);
   c.proxy && 0 < c.proxy.length && (proxyJsonp = c.proxy, "object" === typeof a ?
      a.crossDomain = !0 : "object" === typeof b && (b.crossDomain = !0));
   e && ("object" === typeof a ? a.url && (a.url = d(a.url), a.charset && (a.url += "&charset=" + a.charset), a.dataType = "json") : "string" === typeof a && "object" === typeof b && (a = d(a), b.charset && (a += "&charset=" + b.charset), b.dataType = "json"));
   return jQuery.ajaxOrig.apply(this, arguments)
};
jQuery.ajax.prototype = new jQuery.ajaxOrig;
jQuery.ajax.prototype.constructor = jQuery.ajax;