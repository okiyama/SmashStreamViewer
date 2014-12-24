/**
 * Smash Stream Viewer Chrome extension. Used for seeing what smash bros streams are currently online.
 * 
 *
 * Copyright (C) 2012-2015 Julian Jocque
 * 
 * This file is part of SpeedRunsLive Stream Viewer.
 * 
 * SpeedRunsLive Stream Viewer is free software: you can redistribute it and/or modify
 * it under the terms of version 2 of the GNU General Public License as published by
 * the Free Software Foundation.
 * 
 * SpeedRunsLive Stream Viewer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with SpeedRunsLive Stream Viewer.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Sends an XHR GET request to grab streamer info from Twitch. The
 * XHR's 'onload' event is hooked up to the 'loadRunners' method.
 *
 * @public
 */

 /**
  * How this will change:
      Need to loop through the games, skipping the ones that the user doesn't want.
      A little drop down for each game would be a good idea, but that's an extra click. Remember which ones were dropped down automagically then!
      http://help.twitch.tv/customer/portal/questions/1220448-getting-channels-for-a-game-via-api- this is how you get the games
        Check the total and loop by total % 100 times, using limit 100 to grab all possible pages. This can be tested with limit 2 or whatever
        This will not really be used for a while, but why not make it more future proof.
      "logo" is the icon to use
      Settings to hide games that you don't care about
      Maybe a coloration to the background to denote different games. Icons maybe better?
      Don't sort by number of streams, keep it always in the same spots.
  */

  /**
   * Super%20Smash%20Bros.%20Melee - melee
   * Super%20Smash%20Bros.%20for%20Wii%20U - Wii U
   * Super%20Smash%20Bros.%20for%20Nintendo%203DS - 3DS
   * Super%20Smash%20Bros. - 64
   * Super%20Smash%20Bros.%20Brawl - Brawl
   * Project%20M - Project M
   */
var jsonArray = new Array(); //Will contain the JSON data for making stream lists.
                             //This is global, but after it has data in it, the program doesn't use it globally. 
                             //Instead, it is passed around an used like a local vairable.

function requestStreamers()
{
  //So data flow is search query results in JSON, query can die.

  //Nevermind, we'll steal the "game" attribute and use that to name our sections.
  //So we're good, get a jsonArray then we can loop through that and grab the name of the first "game" to name the sections
  var searchQueries = new Array('Super%20Smash%20Bros.%20Melee',
                                'Super%20Smash%20Bros.%20for%20Wii%20U',
                                'Super%20Smash%20Bros.%20for%20Nintendo%203DS',
                                'Super%20Smash%20Bros.',
                                'Super%20Smash%20Bros.%20Brawl',
                                'Project%20M');

  for (var i = searchQueries.length - 1; i >= 0; i--) {
    var req = new XMLHttpRequest();
    req.open('GET', apiUrl + 'search/streams?limit=100&q=' + searchQueries[i], true);
    req.onload = parseJSON.bind(this, searchQueries.length); //Can't just do this, need to parse out the JSON first.
    //onload = parseJSON(this), somehow get the data back into the data array. Who knows.

    try {
      req.send(null);
    }
    catch (error) {
      var errorMessage = document.createElement('div');
      errorMessage.setAttribute('class', 'errorMessage');
      errorMessage.innerHTML = "Error loading data from Twitch. <br />" +
        "Most likely, Twitch.tv is down. <br />" + 
        "If Twitch.tv is up, please send me an email at JulianJocque+Smash@gmail.com <br /> <br />" +
        "Thank you for you patience while things get sorted!";
      var container = document.getElementById('container');
      container.appendChild(errorMessage);
    }
  };
}

/**
 * Given an XMLhttpRequest which contains JSON data, parses that JSON then adds it to a global array for json data.
 * Once we have parsed all the data and put it into the global array, we pass that array on to the remainder of the program.
 *
 * The reason for the questionable use of the global array is that we're loading things asynchronously, so we don't know what
 * finishes when.
 *
 * @param {XMLhttpRequest} httpRequest The http request.
 * @return The given data as parsed JSON.
 */
function parseJSON(numRequests, httpRequest) 
{
  var unparsed = httpRequest.target.responseText;
  var data = JSON.parse(unparsed);
  jsonArray.push(data);

  //Once we've pushed as many pieces of data as there are requests, we'll move on and pass on the finalized array.
  if(jsonArray.length == numRequests) {
    alert("all done!");
  }
}

/**
 * Loads the content of the popup given the data required, as an array.
 *
 * @param {Array} jsonArray The array of data that we'll build the popup from.
 * @private
 */
function loadRunners(jsonArray)
{
  loadButtons();
  renderDonate();
  //For loop here, loadStreamerList for each JSON and append it appropriately
  var streamerList = loadStreamerList(data);
  document.getElementById('container').appendChild(streamerList);
  $('a').click(openLink);
}

/**
 * Loads the streamerList from the given JSON data then returns it.
 * @param data The JSON data to load the streamer list from.
 * @return The streamerList as a div to append to the document.
 *
 * @private
 */
function loadStreamerList(data)
{
  var streamerList = document.createElement('div');
  streamerList.setAttribute('class', 'streamList');

  //var channels = 

  //Sort by viewers
  var sortedChannels = 
    channels.sort(
      function (a, b) {
        if (a.current_viewers > b.current_viewers) {
          return -1;
        }
        else {
          return 1;
        }
      });

  for (var i = 0; i < sortedChannels.length; i++)
  {
    var channel = sortedChannels[i];
    if (!badGame(channel.meta_game, channel.name))
    {
      var streamer = document.createElement('a');
      streamer.setAttribute('class', 'twitchstreamer');
      streamer.setAttribute('href', '#');
      streamer.setAttribute('streamLink', 'http://www.twitch.tv/' + String(channel.name));
      streamer.setAttribute('streamName', String(channel.name));
      
      var name = document.createElement('span');
      name.setAttribute('class', 'name');
      name.innerHTML = channel.user_name;

      var image = document.createElement('img');
      image.setAttribute('src', channel.image.size70);
      image.setAttribute('class', 'ava');

      var title = document.createElement('span');
      title.setAttribute('class', 'description');
      title.innerHTML = addLinksToText('<p>' + channel.title + '</p>');

      var viewers = document.createElement('span');
      viewers.setAttribute('class', 'viewers');
      viewers.innerHTML = channel.current_viewers + ' viewers' + '<br />';

      var streamerInfo = document.createElement('div');
      streamerInfo.setAttribute('class', 'streamerinfo');
      streamerInfo.appendChild(name);
      streamerInfo.appendChild(viewers);
      streamerInfo.appendChild(title);

      streamer.appendChild(image);
      streamer.appendChild(streamerInfo);
      streamerList.appendChild(streamer);
    }
  };

  return streamerList;
}

/**
 * Loads the buttons for the extension. Sets them appropriately based on previously saved settings.
 *
 * @private
 */
function loadButtons()
{
  setButtonsOnClicks();
  loadOpenLinks();
}

/**
 * Sets the onclick behavior for all the buttons in the extension.
 *
 * @private
 */
function setButtonsOnClicks()
{
  setOpenLinkOnClicks();
  setPageOnClicks();
}

/**
 * Sets the onclick behavior for the buttons which determine how to oepn links in the settings.
 *
 * @private
 */
function setOpenLinkOnClicks()
{
  twitchButton.onclick = function() { storeOpenLink(twitchButton); };
  twitchFSButton.onclick = function() { storeOpenLink(twitchFSButton); };
  srlButton.onclick = function() { storeOpenLink(srlButton); };
}

/**
 * Sets the onclick behavior for the buttons which switch between the pages.
 *
 * @private
 */
function setPageOnClicks()
{
  var currentPageButton = streamsButton;
  settingsButton.onclick = function() { currentPageButton = swapPage(settingsButton, currentPageButton); };
  streamsButton.onclick = function() { currentPageButton = swapPage(streamsButton, currentPageButton);  };
  aboutLink.onclick = function() { currentPageButton = swapPage(aboutLink, currentPageButton); };
}

/**
 * Stores that the given button should be used to open links.
 * 
 * @private
 */
function storeOpenLink(button)
{
  var buttonID = button.id; //For some reason, can't use periods inside the sync set function
  if (button.checked)
  {
	  chrome.storage.sync.set({'openLinksWith': button.id});
    _gaq.push(['_trackEvent', buttonID, 'Activated']);
  }
  else
  {
	  chrome.storage.sync.set({'openLinksWith': button.id});
    _gaq.push(['_trackEvent', buttonID, 'Deactivated']);
  }
}

/**
 * Loads how to open links from storage.
 *
 * @private
 */
function loadOpenLinks()
{
  chrome.storage.sync.get('openLinksWith', function(data) 
  {
    document.getElementById(data['openLinksWith']).checked = true;
  });
}

/**
 * Switches from the current page to the page targeted by nextPageButton.
 * Returns the page ID of the current page after swapping
 *
 * @private
 */
function swapPage(nextPageButton, currentPageButton)
{
  var newPageID = nextPageButton.attributes['target'].nodeValue;
  var currentPageID = currentPageButton.attributes['target'].nodeValue;
  if(nextPageButton != currentPageButton) {
    $(currentPageButton).attr('isSelected', 'false');
    $(nextPageButton).attr('isSelected', 'true');
    $(currentPageID).hide();
    $(newPageID).fadeIn(300);
  }
  return nextPageButton;
}

/**
 * Renders the donation info onto the element which was already appended.
 *
 * @private
 */
function renderDonate()
{  
  $.ajax(
  {
    dataType: 'json',
    async: false,
    type : "GET",
    url : apiUrl + '/test',
    success : function(data) { addDonationInfo(data); }
    });
}

/**
 * Given donation data, adds it to the donation element. Helper for renderDonate.
 * @param data The donation data, as an array
 * @return The donate element
 *
 * @private
 */
function addDonationInfo(data)
{
  var container = document.getElementById('donation_server');

  var currentMonthYear = getCurrentMonthYear();
  var topLine = document.getElementById('donationTopLine');
  topLine.innerHTML = 'SRL server costs - donations for ' + currentMonthYear;

  var donation_bar = document.getElementById('donation_bar');
  donation_bar.setAttribute('style', 'width: ' + data.percent + '%;')

  var amount = document.createElement('span');
  amount.setAttribute('id', 'amount');
  var balance = document.getElementById('d-balance');
  balance.innerHTML = '$' + data.balance;
  var target = document.getElementById('d-target');
  target.innerHTML = '$' + data.target;
}

/**
 * Gets the current month in Month Year format.
 * Ex: December 2013
 *
 * @private
 */
function getCurrentMonthYear()
{
  var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];
  var time = new Date();

  return monthNames[time.getMonth()] + ' ' + time.getFullYear()
}

/**
 * Blacklist of games.
 * Check this before displaying a runner
 * @param game The name of the game
 *
 * @private
 */
function badGame (game) {
  if (game == null) return false;
  if (game.search(/Age of Empires/i) > -1) { return true; }
  if (game.search(/Audiosurf/i) > -1) { return true; }
  if (game.search(/beatmania/i) > -1) { return true; }
  if (game.search(/Dance Dance Revolution/i) > -1) { return true; }
  if (game.search(/DayZ/i) > -1) { return true; }
  if (game.search(/Diablo/i) > -1) { return true; }
  if (game.search(/Dota 2/i) > -1) { return true; }
  if (game.search(/Guild Wars/i) > -1) { return true; }
  if (game.search(/Guitar Hero/i) > -1) { return true; }
  if (game.search(/Heroes of Newerth/i) > -1) { return true; }
  if (game.search(/iDOLM@STER/i) > -1) { return true; }
  if (game.search(/Idolmaster/i) > -1) { return true; }
  if (game.search(/League of Legends/i) > -1) { return true; }
  if (game.search(/Mario Party/i) > -1) { return true; }
  if (game.search(/Minecraft/i) > -1) { return true; }
  if (game.search(/Osu!/i) > -1) { return true; }
  if (game.search(/Ragnarok Online/i) > -1) { return true; }
  if (game.search(/Rock Band/i) > -1) { return true; }
  if (game.search(/RuneScape/i) > -1) { return true; }
  if (game.search(/Starcraft/i) > -1) { return true; }
  if (game.search(/StepMania/i) > -1) { return true; }
  if (game.search(/Super Smash Bros/i) > -1) { return true; }
  if (game.search(/Team Fortress/i) > -1) { return true; }
  if (game.search(/Terraria/i) > -1) { return true; }
  if (game.search(/Total Annihilation/i) > -1) { return true; }
  if (game.search(/Warcraft/i) > -1) { return true; }
  if (game.search(/Worms/i) > -1) { return true; }
return false;
}

/**
 * Takes text and returns the text with a href links added.
 * @param text The text to add links to
 *
 * @public
 */
function addLinksToText(text) {
    var exp = /(https?:\/\/)?(([A-Za-z0-9#-]+[.])+[A-Za-z]{2,3}([\/][A-Za-z0-9#=\?\-]+)*([.][A-Za-z]{2,4})?)(\/?)/ig;
    return text.replace(exp,"<a href='http://$2'>$1$2</a>"); 
}

/**
 * Opens a link to a new tab.
 * Takes into account if we are trying to open a stream or a link within the description of a stream.
 * This is called when <a> elements are clicked.
 * @param e The event that was clicked
 *
 * @private
 */
function openLink(e)
{
    e.stopPropagation();
    if (this.className == "twitchstreamer")
    {
      openTwitchLink(e);
    }
    else
    {
      chrome.tabs.create({ "url": this.href});
    }
}

/**
 * Helper function made specifically to open a twitch streamer.
 * Takes into account the fullscreen button.
 * @param e The event that we get stream information from
 *
 */
 function openTwitchLink(e)
 {
  var howToOpen = document.querySelector('.settingsButton:checked').attributes['id'].nodeValue;
  var streamName = e.currentTarget.attributes['streamName'].nodeValue;

  if (howToOpen == 'twitchFSButton') {
    _gaq.push(['_trackEvent', 'Twitch fullscreen Link', 'used']);
    chrome.tabs.create({ "url": 'http://www.twitch.tv/' + streamName + "/popout/" });
  }
  else if (howToOpen == 'srlButton') {
    _gaq.push(['_trackEvent', 'SRL Link', 'used']);
    chrome.tabs.create({ "url": 'http://speedrunslive.com/#!/' + streamName });
  }
  else {
    //We will default to Twitch for safety
    _gaq.push(['_trackEvent', 'Twitch link', 'used']);
    chrome.tabs.create({ "url": 'http://www.twitch.tv/' + streamName });
  }
    
 }

// Loads stream list as soon as the document's DOM is ready.
document.addEventListener('DOMContentLoaded', function ()
{
  requestStreamers();
});
