var accessToken = null;
var nextUrl = '';
var nextDetailsUrl = '';
function searchPages() {
    var v = document.getElementById('idSearchKeyword').value;
    var url = 'https://graph.facebook.com/search?q='+v+'&type=page&'+ accessToken;
    
    httpGetAsync(url, function(response){
        var list = document.getElementById('pageList');
        var responseJson = JSON.parse(response);
        list.innerHTML = createHtmlList(responseJson.data);
        if(responseJson.paging === undefined)
            return;
        if(responseJson.paging.next !== undefined){
            nextUrl = responseJson.paging.next;
            document.getElementById("moreButton").style.display = "block";
        }
        //alert(nextUrl);
    });
    
}
function createHtmlList(data) {
    var html = '<ul>';
    for(var i=0,len=data.length; i<len ; i++){
        html += '<li id="'+data[i].id+'" name="'+data[i].name+'" onclick="getPageDetail(this.id,this.attributes[\'name\'].value)" class="hoverCursor">'+data[i].name+ '</li>';
    }
    html += '</ul>';
    return html;
}
function markPageAsFavorite(id, name) {
    if (document.getElementById(id).checked) {
        //alert("mark as favorite" + name);
        localStorage.setItem(id.substring(3), name);
    } 
    else {
        //alert("unmark as favorite" + name);
        localStorage.removeItem(id.substring(3));
    }
}
function viewFavorites() {
    var stringVal = '';
    if(!localStorage.length){
        alert("No Favorites Yet");
        return;
    }
    for (var i=0, len=localStorage.length; i<len; i++){
        stringVal += localStorage.getItem(localStorage.key(i)) + ', ';
    }
    alert(stringVal);
}

function getPageDetail(id, name) {
    var url = 'https://graph.facebook.com/'+id + '/feed?' + accessToken;
    httpGetAsync(url, function(response) {
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
    });
}
function getMorePages() {
    if (nextUrl == '')
        return;
    httpGetAsync(nextUrl, function(response) {
        var list = document.getElementById('pageList');
        var responseJson = JSON.parse(response);
        list.innerHTML = list.innerHTML + createHtmlList(responseJson.data);
        nextUrl = '';
        if(responseJson.paging.next !== undefined)
            nextUrl = responseJson.paging.next;
        else
            document.getElementById("save").style.display = "none";
    });
}
function httpGetAsync(theUrl, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

(function() {
    var url = 'https://graph.facebook.com//oauth/access_token?client_id=648897145251733&client_secret=c9be6dbfb98ca266b97d7f247b00b268&grant_type=client_credentials';
    httpGetAsync(url, function(response) {
        accessToken = response;
        //make the search button enabled
    });
    document.getElementById("searchPageByKeyword").onsubmit = function () {
        searchPages();
        return false;
    }
})();