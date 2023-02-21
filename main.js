// Global variables
var CONTINUE = true;
var PARENTS = [];    // each list item contains the id/points/percentages object
var HORSES = [];     // each list item contains the name/points/percentages/%changes object
var idList = [];
var lastID = '';
var baseAddress = null;


// Utility functions
String.prototype.contains = function(e) { return this.indexOf(e) > -1 };
var Log = console.log;


// Check that jQuery is loaded
if (typeof jQuery  === 'undefined' || typeof waitForKeyElements  === 'undefined')
{
   document.getElementById("output").innerHTML += "<b>It doesn't look like you have an internet connection!</b>"
      + "<br>More specifically, I can't access the code I need.<br>Refresh this page once you have internet again.";
   CONTINUE = false;
}


// Setup cross domain AJAX requests utilising PHP
function jQueryProxySetup(_url)
{
   var proxyJsonp = "getdata.php";
   jQuery.ajaxOrig = jQuery.ajax;
   jQuery.ajax = function(a, b) {
      function d(a) {
         a = encodeURI(a).replace(/&/g, "%26");
         a = a.replace('http://', '').replace('https://', '');
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
   
   Log('Successfully run the jQuery proxy setup ...');
}


// Generate a random int between a given range
function getRandom(min, max) { if (min > max) min = max; return Math.floor((Math.random() * max) + min); }


// Output the internal ratio values to the user
function apply(obj)
{
   $("input[id*='Input']").val('');
   if (typeof(obj.stamina) !== 'undefined')  $("#staminaInput").val(obj.stamina * 5);
   if (typeof(obj.speed) !== 'undefined')    $("#speedInput").val(obj.speed * 5);
   if (typeof(obj.dressage) !== 'undefined') $("#dressageInput").val(obj.dressage * 5);
   if (typeof(obj.gallop) !== 'undefined')   $("#gallopInput").val(obj.gallop * 5);
   if (typeof(obj.trot) !== 'undefined')     $("#trotInput").val(obj.trot * 5);
   if (typeof(obj.jump) !== 'undefined')     $("#jumpInput").val(obj.jump * 5);
}


// Calculate the internal ratio values based on the user selection
function setWeightings()
{
   var breeds = $("#breeds").val();
   
   if (breeds.contains('Pure Stamina'))          apply({stamina: 20});
   else if (breeds.contains('Pure Speed'))       apply({speed: 20});
   else if (breeds.contains('Pure Dressage'))    apply({dressage: 20});
   else if (breeds.contains('Pure Gallop'))      apply({gallop: 20});
   else if (breeds.contains('Pure Trot'))        apply({trot: 20});
   else if (breeds.contains('Pure Jump'))        apply({jump: 20});
   else if (breeds.contains('Cross Country'))    apply({stamina: 9, dressage: 6, jump: 4});
   else if (breeds.contains('Cutting'))          apply({stamina: 9, dressage: 6, speed: 4});
   else if (breeds.contains('Gallop'))           apply({gallop: 9, speed: 6, dressage: 4});
   else if (breeds.contains('Barrel Racing'))    apply({speed: 9, stamina: 6, gallop: 4});
   else if (breeds.contains('Trot'))             apply({trot: 9, speed: 6, dressage: 4});
   else if (breeds.contains('Western Pleasure')) apply({trot: 9, stamina: 6, dressage: 4});
   else if (breeds.contains('Show Jumping'))     apply({jump: 9, dressage: 6, speed: 4});
   else if (breeds.contains('Reining'))          apply({gallop: 9, dressage: 6, stamina: 4});
   else if (breeds.contains('Dressage'))         apply({dressage: 9, trot: 6, gallop: 4});
   else if (breeds.contains('Trail Class'))      apply({dressage: 9, trot: 6, jump: 4});
   
   Log('Calculating ratios ...');
   reloadStats(lastID);
}


// Main
if (CONTINUE)
{
   Log('Starting ...');
   
   jQueryProxySetup();
   
   // Ensure the calculator's HTML has loaded
   waitForKeyElements("#lastElement", Calc, true);
}


// Performed when the function is finished
function Finished()
{
   lastLastHorse = lastHorse;
   lastHorse = $("#horseid").val();
   CONTINUE = true;
   errorRetry = true;
   
   Log('Finished calculations ...');
}
   
   
function checkGivenWeightings()
{
   var totalWeightingsValue = 0;
   var inputs = $("input[id*='Input']");
   
   for (var i = 0; i < inputs.length; i++)
   {
      if (parseInt(inputs.eq(i).val()))
         totalWeightingsValue += Math.abs(parseInt(inputs.eq(i).val()));
   }
   
   Log('Checking weightings ...');
}


// Main calculator function
function Calc()
{
   if (!CONTINUE)
      return;
   
   Log('Running setup ...');
   setWeightings();
   
   $("#breeds").on("change", setWeightings);
   $("#form").on("submit", QueryHorse);
}


// Add a new horse to the list, and if it's valid, place it accordingly in the list
function QueryHorse()
{
   var newHorse = $("#horseid").val();
   baseAddress = newHorse.match(/(https\:\/\/)([a-zA-Z\.]+)(?=\/elevage)/g)[0] || null;
   
   if (idList.indexOf(newHorse) == -1) {
      idList.push(newHorse);
      CalculateHorseStats(newHorse);
   }
   else
      $('#loadingHorse').hide();
}


function AddHorse(horseObj)
{
   if (typeof horseObj !== 'undefined' && horseObj != null)
   {
      HORSES.push(horseObj);
      if (HORSES.length > 1)
         HORSES = HORSES.sort(function(a, b) {return b.points - a.points} );
      
      $('#loadingHorse').hide();
      
      Log('Finished horse stat calculation ...');
      
      lastID = horseObj.id;
      reloadStats(horseObj.id);
   }
   else
   {
      // Report error
      Log('Error in AddHorse ...');
   }
}

function reloadStats(id)
{
   RecalculateList(id);
   ShowStats(id);
}

function ShowStats(id)
{
   for (var i = 0; i < HORSES.length; i++)
   {
      if (HORSES[i].id == id)
      {
         var h = HORSES[i];
         var agHelp = '<span class="help" title="Actual goodness means the raw score of the horse when '
                    + 'evaluated against the goal skill ratios."> [?] </span>';
         var rgHelp = '<span class="help" title="Relative goodness is actual goodness relative to the other '
                    + 'horses in the list"> [?] </span>';
         
         var s = '<table>'
               + '<tr><td class="bold">Actual Goodness (AG)' + agHelp + ':</td><td class="padLeft">' 
                  + h.points.toFixed(6) + '</td></tr>'
               + '<tr><td class="bold">Relative Goodness (RG)' + rgHelp + ':</td><td class="padLeft">' 
                  + h.relPoints.toFixed(6) + '</td></tr>'
               + '<tr><td>&nbsp;</td></tr><tr><td>&nbsp;</td></tr></table>'
               + '<table><tr><td colspan="3"><h3>Compared to parents:</h3></td></tr>'
               + '<tr><td class="bold">Goodness Comparison</td><td class="padLeft">'
                  + (h.pointsDiff > 0 ? '<span class="plus">+</span>' : '<span class="minus">-</span>')
                  + '</td><td class="num">' + Math.abs(h.pointsDiff).toFixed(6) + '</td></tr>'
               + '<tr><td class="bold">GP Increase</td><td>&nbsp;</td>'
                  + '<td class="num">' + (h.gp - h.parentsGP).toFixed(3) + '</td></tr>'
               + '<tr><td>&nbsp;</td></tr>'
               + '<tr><td colspan="3" class="header">Genetic Percentage Changes:</td></tr>'
               + '<tr><td class="bold">Stamina</td><td class="padLeft">'
                  + (h.percentageChanges.st > 0 ? '<span class="plus">+</span>' : '<span class="minus">-</span>')
                  + '</td><td class="num">' + Math.abs(h.percentageChanges.st) + '%</td></tr>'
               + '<tr><td class="bold">Speed</td><td class="padLeft">' 
                  + (h.percentageChanges.sp > 0 ? '<span class="plus">+</span>' : '<span class="minus">-</span>')
                  + '</td><td class="num">' + Math.abs(h.percentageChanges.sp) + '%</td></tr>'
               + '<tr><td class="bold">Dressage</td><td class="padLeft">' 
                  + (h.percentageChanges.dr > 0 ? '<span class="plus">+</span>' : '<span class="minus">-</span>')
                  + '</td><td class="num">' + Math.abs(h.percentageChanges.dr) + '%</td></tr>'
               + '<tr><td class="bold">Gallop</td><td class="padLeft">' 
                  + (h.percentageChanges.ga > 0 ? '<span class="plus">+</span>' : '<span class="minus">-</span>')
                  + '</td><td class="num">' + Math.abs(h.percentageChanges.ga) + '%</td></tr>'
               + '<tr><td class="bold">Trot</td><td class="padLeft">' 
                  + (h.percentageChanges.tr > 0 ? '<span class="plus">+</span>' : '<span class="minus">-</span>')
                  + '</td><td class="num">' + Math.abs(h.percentageChanges.tr) + '%</td></tr>'
               + '<tr><td class="bold">Jumping</td><td class="padLeft">' 
                  + (h.percentageChanges.ju > 0 ? '<span class="plus">+</span>' : '<span class="minus">-</span>')
                  + '</td><td class="num">' + Math.abs(h.percentageChanges.ju) + '%</td></tr>'
               + '</table>';
         
         $("#horseStats").html(s);
         $("span.help").tooltip();
      }
   }
}

function decimalPlaces(num, places)
{
   return parseInt(num * Math.pow(10, places)) / (Math.pow(10, places));
}

function RecalculateList(recentID)
{
   Log('Recalculating horse list ...');
   
   $("#horseList").html('');
   
   for (var i = 0; i < HORSES.length; i++)
   {
      var h = HORSES[i];
      h.points = getPoints(h);
      h.pointsDiff = h.points - getPoints( { percentages: h.parentsAvgStats } );
   }
   
   for (var i = 0; i < HORSES.length; i++)
      HORSES[i].relPoints = (HORSES[i].points - HORSES[HORSES.length - 1].points);
   
   while (HORSES.length > 1 && HORSES[HORSES.length - 2].relPoints < 1)
   {
      for (var i = 0; i < HORSES.length; i++)
         HORSES[i].relPoints *= 10;
   }
   
   for (var i = 0; i < HORSES.length; i++)
   {
      var h = HORSES[i];
      
      var newItem = '<div id="' + h.id + '" class="horseListItem" name="' + (recentID == h.id ? 'selected' : '') + '">'
            + '<span style="font-style: italic; font-weight: bold;">'
               + '<a href="' + h.url + '" target="_BLANK">' + h.name + '</a>'
            + '</span><span class="exit" style="float: right; cursor: pointer;">X</span><br>'
            + '<span style="color: red; float: left;">' + h.gp + ' GP</span>'
            + '<span style="color: blue; float: right;">' + decimalPlaces(h.relPoints, 2) + ' RG</span>'
         + '</div>';
      $("#horseList").append(newItem);
      
      $("#" + h.id).click(function()
      {
         var n = $(this).attr('name');
         var id = $(this).attr('id');
         $("div.horseListItem[name='selected']").attr('name', '');
         $(this).attr('name', (n === 'selected' ? '' : 'selected'));
         lastID = id;
         ShowStats(id);
      });
   }
   
   $("span.exit").click(function()
   {
      var id = $(this).parent().attr("id");
      for (var i = 0; i < HORSES.length; i++)
      {
         if (HORSES[i].id == id)
            HORSES.splice(i, 1);
      }
      if (HORSES.length > 0)
      {
         var lastIDExists = false;
         for (var i = 0; i < HORSES.length; i++)
         {
            if (HORSES[i].id == lastID)
               lastIDExists = true;
         }
         if (lastIDExists)
            reloadStats(lastID);
         else
            reloadStats(HORSES[0].id);
      }
      else
      {
         $("#horseList").html('');
         $("#horseStats").html('');
      }
   });
}


function processUrl(s)
{
   if (s[0] === '/')
      return baseAddress + s;
   else
      return s;
}


function DoAjax(obj)
{
   var _url = obj.url.replace('chevaux/cheval', 'fiche/');
   var _beforeSend = obj.beforeSend;
   var _error = obj.error;
   var _success = obj.success;
   
   if (_url == null || _success == null)
      return null;
   
   Log('AJAX request on ' + _url + ' ...');
   
   return $.ajax({
      crossOrigin: true,
      url: _url,
      context: {},
      beforeSend: _beforeSend,
      error: _error,
      success: _success
   });
}


function getPoints(h)
{
   var tVal = 0, actualValue = 0, inputs = $("input[id*='Input']");;
   
   for (var i = 0; i < inputs.length; i++)
   {
      if (parseInt(inputs.eq(i).val()))
         tVal += Math.abs(parseInt(inputs.eq(i).val()));
   }
   
   for (var i = 0; i < inputs.length; i++)
   {
      if (parseInt(inputs.eq(i).val()))
      {
         var inputValue = Math.round( Math.abs( parseInt(inputs.eq(i).val()) ), (100 / tVal) );
         var type = inputs.eq(i).attr("id").slice(0, 2);
         var f = h.percentages[type] * inputValue;
         actualValue += f;
      }
   }
   
   Log('Calculating horse points (' + h.url + ') ...');
   
   return actualValue;
}


// Retrieves the data for the horse and calculates its 'goodness'
function CalculateHorseStats(_url)
{
   $('#loadingHorse').show();
   
   Log('Grabbing horse data (' + _url + ') ...');

   // Return some data for the horse back to AddHorse so it can work with it
   var newHorseData = {
      id                : _url.match(/[0-9]+/g)[0],
      name              : null,
      url               : _url,
      points            : null,
      parentsAvgStats   : null,
      relPoints         : null,
      percentages       : null,
      percentageChanges : null,
      gp                : null,
      father            : null,
      mother            : null,
      fatherData        : null,
      motherData        : null,
      parentsGP         : null
   };
   
   function onError(a, b, c) {
      Log(a, b, c);
   }
   
   function onParentError(a, b, c) {
      Log(a, b, c);
   }
   
   function onHorseSuccess(data)
   {
      // Get horse stats from AJAX response
      var horseStats = {
         st:      parseFloat($(data).find("#enduranceGenetique").html()) || -1
         ,sp:     parseFloat($(data).find("#vitesseGenetique").html()) || -1
         ,dr:     parseFloat($(data).find("#dressageGenetique").html()) || -1
         ,ga:     parseFloat($(data).find("#galopGenetique").html()) || -1
         ,tr:     parseFloat($(data).find("#trotGenetique").html()) || -1
         ,ju:     parseFloat($(data).find("#sautGenetique").html()) || -1
         ,father: $(data).find("#origins-body-content").find("a.horsename").eq(0) || null
         ,mother: $(data).find("#origins-body-content").find("a.horsename").eq(1) || null
         ,gp:     parseFloat(($(data).find("#genetic-body-content").find('table').eq(0).find("strong:contains(':')").html() || '1').match(/\-?[0-9]+\.[0-9]+/g)[0])
         ,name:   $(data).find("h1.horse-name").find("a").html() || 'Horse'
      },
      fatherStats = null,
      motherStats = null,
      fatherAjax = null,
      motherAjax = null,
      fatherExists = false,
      motherExists = false;
      
      // Check if the ID of the parents already exists in the PARENTS array
      for (var i = 0; i < PARENTS.length; i++)
      {
         // If the parents data is already stored, use it and remember that we've done so
         if (horseStats.father != null && PARENTS[i].url == horseStats.father.attr('href'))
         {
            fatherExists = true;
            fatherStats = PARENTS[i];
         }
         if (horseStats.mother != null && PARENTS[i].url == horseStats.mother.attr('href'))
         {
            motherExists = true;
            motherStats = PARENTS[i];
         }
      }
      
      
      // Retrieve fathers data if the fathers data isn't already stored
      if (!fatherExists)
      {
         fatherAjax = DoAjax({
            url      : processUrl(horseStats.father.attr("href")),
            error    : onParentError,
            success  : function(_data)
            {
               if ($(_data).find("div:contains('is now in Heaven')").length != 0)
                  fatherStats = null;
               else
               {
                  fatherStats = {
                     st:   parseFloat($(_data).find("#enduranceGenetique").html()) || -1
                     ,sp:  parseFloat($(_data).find("#vitesseGenetique").html()) || -1
                     ,dr:  parseFloat($(_data).find("#dressageGenetique").html()) || -1
                     ,ga:  parseFloat($(_data).find("#galopGenetique").html()) || -1
                     ,tr:  parseFloat($(_data).find("#trotGenetique").html()) || -1
                     ,ju:  parseFloat($(_data).find("#sautGenetique").html()) || -1
                     ,gp:  parseFloat(($(data).find("#genetic-body-content").find('table').eq(0).find("strong:contains(':')").html() || '1').match(/\-?[0-9]+\.[0-9]+/g)[0])
                  };
                  
                  fatherStats.st = fatherStats.st / fatherStats.gp * 100;
                  fatherStats.sp = fatherStats.sp / fatherStats.gp * 100;
                  fatherStats.dr = fatherStats.dr / fatherStats.gp * 100;
                  fatherStats.ga = fatherStats.ga / fatherStats.gp * 100;
                  fatherStats.tr = fatherStats.tr / fatherStats.gp * 100;
                  fatherStats.ju = fatherStats.ju / fatherStats.gp * 100;
                  fatherStats.url = horseStats.father.attr("href");
               }
            }
         });
      }
      
      // Retrieve mothers data if the mothers data isn't already stored
      if (!motherExists)
      {
         motherAjax = DoAjax({
            url      : processUrl(horseStats.mother.attr("href")),
            error    : onParentError,
            success  : function(_data)
            {
               if ($(_data).find("div:contains('is now in Heaven')").length != 0)
                  motherStats = null;
               else
               {
                  motherStats = {
                     st:   parseFloat($(_data).find("#enduranceGenetique").html()) || -1
                     ,sp:  parseFloat($(_data).find("#vitesseGenetique").html()) || -1
                     ,dr:  parseFloat($(_data).find("#dressageGenetique").html()) || -1
                     ,ga:  parseFloat($(_data).find("#galopGenetique").html()) || -1
                     ,tr:  parseFloat($(_data).find("#trotGenetique").html()) || -1
                     ,ju:  parseFloat($(_data).find("#sautGenetique").html()) || -1
                     ,gp:  parseFloat(($(data).find("#genetic-body-content").find('table').eq(0).find("strong:contains(':')").html() || '1').match(/\-?[0-9]+\.[0-9]+/g)[0])
                  };
                  
                  motherStats.st = motherStats.st / motherStats.gp * 100;
                  motherStats.sp = motherStats.sp / motherStats.gp * 100;
                  motherStats.dr = motherStats.dr / motherStats.gp * 100;
                  motherStats.ga = motherStats.ga / motherStats.gp * 100;
                  motherStats.tr = motherStats.tr / motherStats.gp * 100;
                  motherStats.ju = motherStats.ju / motherStats.gp * 100;
                  motherStats.url = horseStats.mother.attr("href");
               }
            }
         });
      }
      
      
      // Only wait for AJAX requests for parents that we had to retrieve data for
      if (!fatherExists && !motherExists)
         $.when(fatherAjax, motherAjax).then(calculateStats);
      else if (fatherExists && !motherExists)
         $.when(motherAjax).then(calculateStats);
      else if (!fatherExists && motherExists)
         $.when(fatherAjax).then(calculateStats);
      else
         calculateStats();
      
      
      // Calculate the horses stats, and its stats in relation to the parents
      function calculateStats()
      {
         Log('Starting horse stat calculation (' + newHorseData.url + ') ...');
         
         // Set the stats that don't need parental existance certainty first
         newHorseData.percentages = {
            st    : horseStats.st / horseStats.gp * 100
            ,sp   : horseStats.sp / horseStats.gp * 100
            ,dr   : horseStats.dr / horseStats.gp * 100
            ,ga   : horseStats.ga / horseStats.gp * 100
            ,tr   : horseStats.tr / horseStats.gp * 100
            ,ju   : horseStats.ju / horseStats.gp * 100
         };
         newHorseData.gp = horseStats.gp;
         newHorseData.name = horseStats.name;
         
         if (fatherStats != null)
         {
            newHorseData.father = horseStats.father.attr("href");
            newHorseData.fatherData = fatherStats;
         }
         if (motherStats != null)
         {
            newHorseData.mother = horseStats.mother.attr("href");
            newHorseData.motherData = motherStats;
         }
         
         
         // Check for missing parents, and compromise if needed
         if (fatherStats == null && motherStats == null)
            return;
         else if (motherStats == null)
            motherStats = fatherStats;
         else if (fatherStats == null)
            fatherStats = motherStats;
         
         
         // Add the parents to the PARENTS array if they're not in there already
         if (!fatherExists)
            PARENTS.push(fatherStats);
         if (!motherExists)
            PARENTS.push(motherStats);
         
         
         // Calculate the average stats of the parents
         var parentsAvgStats = {
            st:   (motherStats.st + fatherStats.st) / 2
            ,sp:  (motherStats.sp + fatherStats.sp) / 2
            ,dr:  (motherStats.dr + fatherStats.dr) / 2
            ,ga:  (motherStats.ga + fatherStats.ga) / 2
            ,tr:  (motherStats.tr + fatherStats.tr) / 2
            ,ju:  (motherStats.ju + fatherStats.ju) / 2
            ,gp:  (motherStats.gp + fatherStats.gp) / 2
         };
         
         // Compare the average parents stats to the horse
         newHorseData.percentageChanges = {
            st    : decimalPlaces(newHorseData.percentages.st - parentsAvgStats.st, 8)
            ,sp   : decimalPlaces(newHorseData.percentages.sp - parentsAvgStats.sp, 8)
            ,dr   : decimalPlaces(newHorseData.percentages.dr - parentsAvgStats.dr, 8)
            ,ga   : decimalPlaces(newHorseData.percentages.ga - parentsAvgStats.ga, 8)
            ,tr   : decimalPlaces(newHorseData.percentages.tr - parentsAvgStats.tr, 8)
            ,ju   : decimalPlaces(newHorseData.percentages.ju - parentsAvgStats.ju, 8)
         };
         newHorseData.parentsGP = parentsAvgStats.gp;
         newHorseData.parentsAvgStats = parentsAvgStats;
         newHorseData.points = getPoints(newHorseData);
         
         AddHorse(newHorseData);
      }
   }
   
   DoAjax({
      url      : _url,
      error    : onError,
      success  : onHorseSuccess
   });
}