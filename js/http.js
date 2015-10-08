function http(url) {
    var core = {
        ajax : function (method, url, args) {
            var promise = new Promise( function (resolve, reject) {
                var client = new XMLHttpRequest();
                var uri = url;

                if (args && (method === 'GET')) {
                    uri += '?';
                    var argcount = 0;
                    for (var key in args) {
                        if (args.hasOwnProperty(key)) {
                            if (argcount++) {
                                uri += '&';
                            }
                            uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
                        }
                    }
                }
                client.open(method, uri);
                client.send();
                client.onload = function () {
                    if (this.status >= 200 && this.status < 300) {
                        resolve(this.response);
                    } else {
                        reject(this.statusText);
                    }
                };
                client.onerror = function () {
                    reject(this.statusText);
                };
            });
            return promise;
        }
    };
    return {
        'get': function(args) {
            return core.ajax('GET', url, args);
        }
    };
}