var apiKey = "AIzaSyDmVBc4vIy8hBBFnv3tB3VvhZwUewNqYjs";
var arrQueue = [];
var isPlay = false;
var player;
var done = false;
var lenVideoPlay;

function init() {
    gapi.client.setApiKey(apiKey);
    gapi.client.load("youtube", "v3", function () {
        console.log('Youtube API already');
    });
}

$( "#frm-search" ).submit(function( event ) {
    event.preventDefault();

    $.get(
        "https://www.googleapis.com/youtube/v3/search", {
            part: 'snippet,id',
            q: $("#keyword").val(),
            maxResults: 25,
            type: 'video',
            order: "viewCount",
            videoDuration: "medium",
            key: apiKey
        },
        function(data) {
            // console.log(data.items.length);
            var data2 = [];
            $('#result-search').html("");
            var content = "";
            for (var i = 0; i < data.items.length; i++) {
                var url1 = "https://www.googleapis.com/youtube/v3/videos?id=" + data.items[i].id.videoId + "&key=" + apiKey + "&part=snippet,contentDetails";
                $.ajax({
                    async: false,
                    type: 'GET',
                    url: url1,
                    success: function(data) {
                        if (data.items.length > 0) {
                            // console.log(JSON.stringify(data.items[0]));
                            data2[i] = data.items[0];
                            content = content + getResults(data.items[0]);
                            
                        }
                    }
                });
            }
            $('#result-search').append(content);

            var index;
            $(".item-search").click(function(){
                index = $(".item-search").index(this);
                // console.log(index);
                addVideoPlay(data2[index])
                // addVideoToQueue(data2[index])
            })

        });
});
$(function(){

       
})


function getResults(item) {
    var videoID = item.id;
    // console.log(videoID);
    var title = item.snippet.title;
    var thumb = item.snippet.thumbnails.high.url;
    var durationR = convert_time(item.contentDetails.duration);
    var duration = convertT(durationR);
    var channelTitle = item.snippet.channelTitle;

    // console.log(videoID);
    // console.log(title);
    // console.log(thumb);
    // console.log(duration);
    // console.log("<button class='add' onclick=addVideoPlay('" + videoID + "', '" + title + "', '" + thumb + "', '" + duration + "')>Add</button>");

    var output = 
        "<div class='item-video item-search'>" +
            "<img class='thumb' src='" + thumb + "'>" +
            "<div>" +
                "<p class='title'>" + title + "</p>" +
                "<p class='len'>" + duration + "</p>" +
            "</div>" +
            "<button class='add' >Add</button>" +
        "</div>";
    return output;
}

function convertT(x) {
    var h = x[0];
    var m = x[1];
    var s = x[2];
    return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

function convert_time(duration) {
    var a = duration.match(/\d+/g);

    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }

    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }

    duration = 0;

    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }

    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }

    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    var h = Math.floor(duration / 3600);
    var m = Math.floor(duration % 3600 / 60);
    var s = Math.floor(duration % 3600 % 60);
    return [h, m, s];
    // return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s);
}

function addVideoPlay(item) {
    console.log(arrQueue.length);
    console.log(isPlay);

    if (isPlay == false) {
        isPlay = true;
        localStorage.clear();
        var videoID = item.id;
        var durationR = convert_time(item.contentDetails.duration);
        lenVideoPlay = (durationR[0] * 60 * 60 + durationR[1] * 60 + durationR[2]) * 1000;
        console.log(lenVideoPlay);

        play(videoID);

        // $('#video').html('');
        // var content = 
        // "<iframe width='640' height='360'" +
        //     "src='https://www.youtube.com/embed/" + videoID + "?autoplay=1'" +
        //     "frameborder='0" +
        //     "style='border: solid 4px #37474F'" +
        // "></iframe>"
        // $('#video').append(content);
    } else {
        arrQueue[arrQueue.length] = item;
        addVideoToQueue(item);
    }
}

function play(videoID) {
    console.log(videoID);
    // $('#video').html('');
    player = new YT.Player('video', {
        height: '390',
        width: '640',
        videoId: videoID,
        events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}

function onPlayerStateChange(event) {
    // if (event.data == YT.PlayerState.PLAYING && !done) {
    //     setTimeout(stopVideo, 6000);
    //     done = true;
    // }

    if (event.data == YT.PlayerState.ENDED) {
        setNextVideo();
    }
}

function setNextVideo() {
    var keys = Object.keys(localStorage);
    if (keys.length <= 0) {
        return;
    }
    var value = localStorage.getItem(keys[0])
    var item = JSON.parse(value);
    var videoID = item.id;
    console.log(videoID);
    $('#test-video').html('');
    $('#test-video').append("<div id='video'></div>");
    play(videoID);
    deleteItemVideoPlayed(videoID);
    reloadQueuePlay();
}

function stopVideo() {
    player.stopVideo();
}

function addVideoToQueue(item) {
    var videoID = item.id;
    // console.log(videoID);
    var title = item.snippet.title;
    var thumb = item.snippet.thumbnails.high.url;
    var durationR = convert_time(item.contentDetails.duration);
    var duration = convertT(durationR);
    var channelTitle = item.snippet.channelTitle;

    var output = 
        "<div class='item-video item-queue'>" +
            "<img class='thumb' src='" + thumb + "'>" +
            "<div>" +
                "<p class='title'>" + title + "</p>" +
                "<p class='len'>" + duration + "</p>" +
            "</div>" +
            "<button class='play' onclick=playNow('" + videoID + "') >Play</button>" +
        "</div>";

    $('#queue-play').append(output);

    localStorage.setItem(videoID, JSON.stringify(item));

}

function playNow(videoID) {

    $('#video').html('');
    var content = 
    "<iframe width='640' height='360'" +
        "src='https://www.youtube.com/embed/" + videoID + "?autoplay=1'" +
        "frameborder='0" +
        "style='border: solid 4px #37474F'" +
    "></iframe>"
    $('#video').append(content);

    deleteItemVideoPlayed(videoID);
    reloadQueuePlay();
}

function deleteItemVideoPlayed(videoID) {
    localStorage.removeItem(videoID);
}

function reloadQueuePlay() {
    var content = "";
    var keys = Object.keys(localStorage);
    for (var i = 0; i < keys.length; i++) {
        var value = localStorage.getItem(keys[i])
        var item = JSON.parse(value);

        var videoID = item.id;
        var title = item.snippet.title;
        var thumb = item.snippet.thumbnails.high.url;

        var durationR = convert_time(item.contentDetails.duration);
        var duration = convertT(durationR);

        content = content + 
        "<div class='item-video item-queue'>" +
            "<img class='thumb' src='" + thumb + "'>" +
            "<div>" +
                "<p class='title'>" + title + "</p>" +
                "<p class='len'>" + duration + "</p>" +
            "</div>" +
            "<button class='play' onclick=playNow('" + videoID + "') >Play</button>" +
        "</div>";
    }
    $('#queue-play').html('')
    $('#queue-play').append(content);

}



// $('.add').click(function () {
//     console.log($(this).text());
//     console.log($('.add').index(this));
// });

// $( window ).resize(function() {
//     resetVideoHeight();
// });

// function resetVideoHeight() {
//     var h = $("#main-right").width() * 9/16;
//     var w = $("#main-right").width() * 0.8;
//     $("iframe").css("height", h);
//     $("iframe").css("width", w);
// }
// $(".item-video").click(function(e){
//     console.log(e)
// });