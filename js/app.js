var access_token = null;
var baseURL = 'https://graph.facebook.com/';
var nextUrl = '';

//function to be executed on document ready
(function() {
    var tokenUrl = baseURL + 'oauth/access_token';
    var args = {
        'client_id': '648897145251733',
        'client_secret': 'c9be6dbfb98ca266b97d7f247b00b268',
        'grant_type': 'client_credentials'
    };
    http(tokenUrl).get(args)
    .then(onGettingAccessToken)
    .catch(logError);
})();

//generic method to print error log
function logError(errorString) {
    console.error("Error : " + errorString);
}

//event listener - on input form submit
function searchPages() {
    var searchUrl = baseURL + 'search';
    var searchArguments = {
        'q' : document.getElementById('idSearchKeyword').value,
        'type' : 'page',
        'access_token' : access_token
    };
    
    http(searchUrl).get(searchArguments)
    .then(onSearchPageResult)
    .catch(logError);
    
    return false;
}

//event listener - on more button click
function getMorePages() {
    if (nextUrl == '')
        return;
    http(nextUrl).get()
    .then(onGetNextPageResultSuccess)
    .catch(logError);
}

//event listener - on item click in page list
/*example for closure
using variable id, name outside the lexical scope of function getPageDetail
*/
function getPageDetail(id, name) {
    var pageFeedUrl = baseURL + id + '/feed';
    var pageFeedOptions = {
        'access_token' : access_token
    };
    http(pageFeedUrl).get(pageFeedOptions)
    .then(function(response) {
        var detail = document.getElementById('detailFeeds');
        var jsonResponse = JSON.parse(response);
        var data = jsonResponse.data;
        var checkedValue = '';
        if (localStorage.getItem(id) !== null) {
            checkedValue = 'checked';
        }
        var html = '<h3>Feeds for '+ name+'</h3><input type="checkbox" value="false" id="chk'+id+'" name="'+name+'" onclick="markPageAsFavorite(this.id,this.attributes[\'name\'].value)" '+checkedValue+'>Mark this page as favorite<br><ul>'
        for (var i=0, len=data.length; i<len; i++) {
            var timestamp = data[i].created_time;
            var feedDate = new Date(timestamp);
            var displayDate = feedDate.getDate() + '/' + (feedDate.getMonth() + 1) + '/' +  feedDate.getFullYear();
            if(data[i].message === undefined)
                html += '<li>'+displayDate + ' - ' +data[i].story +'</li>';
            else
                html += '<li>'+displayDate + ' - ' +data[i].message +'</li>';
        }
        html += '</ul';
        detail.innerHTML = html;
    })
    .catch(logError);
}

//event listener - on checkbox click mark as favorite
function markPageAsFavorite(id, name) {
    if (document.getElementById(id).checked) {
        localStorage.setItem(id.substring(3), name);
    } 
    else {
        localStorage.removeItem(id.substring(3));
    }
}

//event listener - on view my favorites button click
function viewFavorites() {
    var stringVal = '';
    if(!localStorage.length){
        alert("No Favorites Yet");
        return;
    }
    for (var i=0, len=localStorage.length; i<len; i++) {
        stringVal += localStorage.getItem(localStorage.key(i)) + ', ';
    }
    alert(stringVal);
}

//success handlers for different ajax calls
function onGettingAccessToken(tokenString) {
    access_token = tokenString.substring("access_token=".length);
    document.getElementById("searchPageByKeyword").onsubmit = searchPages;
}

function onSearchPageResult(response) {
    var list = document.getElementById('pageList');
    var responseJson = JSON.parse(response);
    list.innerHTML = createHtmlList(responseJson.data);
    if(responseJson.paging === undefined)
        return;
    if(responseJson.paging.next !== undefined){
        nextUrl = responseJson.paging.next;
        document.getElementById("moreButton").style.display = "block";
    }
}





function onGetNextPageResultSuccess(response) {
    var list = document.getElementById('pageList');
    var responseJson = JSON.parse(response);
    list.innerHTML = list.innerHTML + createHtmlList(responseJson.data);
    nextUrl = '';
    if(responseJson.paging.next !== undefined)
        nextUrl = responseJson.paging.next;
    else
        document.getElementById("save").style.display = "none";
}

function createHtmlList(data) {
    var html = '<ul>';
    for(var i=0,len=data.length; i<len ; i++){
        html += '<li id="'+data[i].id+'" name="'+data[i].name+'" onclick="getPageDetail(this.id,this.attributes[\'name\'].value)" class="hoverCursor">'+data[i].name+ '</li>';
    }
    html += '</ul>';
    return html;
}
