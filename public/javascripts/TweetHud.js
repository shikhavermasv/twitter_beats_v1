var app = angular.module('TweetGlobe', ['ngResource', 'pubnub.angular.service']);

app.controller('TweetHud', function($scope, $resource, $timeout, $rootScope, $timeout, PubNub) {

	var TWEET_SAMPLE_SIZE = 50, // The nubmer of Tweet to display in the left-hand column
      TREND_POLL_INTERVAL = 120000; // Trend update time interval

  /**
   *  Initializes PubNub websocket connection
   */
  $scope.init = function () {
  	$scope.tweets = [];

		PubNub.init({
      subscribe_key: pubnubConfig.subscribe_key,
      ssl: location.protocol == 'https:'
    });

	 	PubNub.ngSubscribe({
      channel: pubnubConfig.channel
    });

	  $rootScope.$on(PubNub.ngMsgEv(pubnubConfig.channel), function(event, payload) {
      
      // Add tweet to this hud
	    addTweet(payload.message);

      // Add tweet to 3D globe
      TwtrGlobe.onTweet(payload.message);
	  });
    
	  getTrends();
  }

  /**
   * GET request trends every TREND_POLL_INTERVAL and sets them on binded model
   */
  function getTrends () {
    $scope.trendsResource = $resource('/trends');
      var arr=[];

    $scope.trendsResource.query( { }, function (res) {
      $scope.trends = res
      for(i=0;i<res.length;i++){
              arr.push(res[i].name);      
      }
      console.log(arr);
      getarr(arr);
    });

    $timeout(function () {
    	getTrends();
    }, TREND_POLL_INTERVAL);
  }

function getarr(arr){
  var arr2=[];
    for(i=0;i<20;i++){
      arr2.push(arr[i]);
      }
console.log("hiii");
console.log(arr2);
      var width =1200,
height=400;
var wordScale=d3.scale.linear().range([10,60]);
var fill = d3.scale.category20();
var x=10;
      var strarr2= arr2.map(function(d) {
        x--;
       return {text: d, size: x-3};
     });
 d3.select("svg").remove();
wordScale
.domain([d3.min(strarr2,function(d){
return d.size;

}),
d3.max(strarr2,function(d){
return d.size;

})
]);
    d3.layout.cloud().size([width, height])
      .words(strarr2)
      //.rotate(function() { return ~~(Math.random() * 2) * 90; })
      .font("Impact")
      .fontSize(function(d) { return wordScale(d.size); })
      .on("end", draw)
      .start();

  function draw(words) {

    d3.select("#word-cloud").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate("+(width/2)+","+(height/2)+")")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
  }
  

    }
  /**
   * Adds Tweet data to binded model
   */
  function addTweet (tweet) {
//console.log(tweet);
  	tweet.sentiment.state = getSentimentState(tweet.sentiment.score);

  	$scope.$apply(function () {
	  	$scope.tweets.unshift(tweet);
  	});

	  if ($scope.tweets.length > TWEET_SAMPLE_SIZE) {
	  	$scope.$apply(function () {
		  	$scope.tweets.pop();
	  	});
  	}

  	measureSentiment();
  }

  $scope.avgSentiment = (0).toFixed(2);
  var sentimentScoreTotal = 0;
var positive=0;
var negative=0;
var neutral=0;
  /**
   * Averages sentiment of the TWEET_SAMPLE_SIZE
   */

$scope.hashtagfunc= function(){
$scope.testurl="";
  var hashtagvar=document.getElementById("gethash").value;  

$scope.testurl = hashtagvar;
alert($scope.testurl);

}


  function measureSentiment () {
    sentimentScoreTotal = 0;

    angular.forEach($scope.tweets, function(tweet, key) {
      sentimentScoreTotal = sentimentScoreTotal + tweet.sentiment.score;
var scoreone = tweet.sentiment.score;
 if (scoreone < 0) {
 positive = positive+1;
  }
  else if (scoreone > 0) {
  negative = negative+1;

  }else{
neutral = neutral +1;
}

    });

    $scope.avgSentiment = (Math.round((sentimentScoreTotal / TWEET_SAMPLE_SIZE) * 500) / 100).toFixed(2);
    $scope.sentimentState = getSentimentState($scope.avgSentiment);
    $scope.positive=positive;
    $scope.negative=negative;
    $scope.neutral=neutral;

  }

  /**
   *  Returns sentiment description for use as a CSS class
   */
	function getSentimentState (score) {
		
		var state = 'neutral';

  	if (score < 0) {
  		state = 'negative';
  	}
  	else if (score > 0) {
  		state = 'positive';
  	}

		return state;
	}

  /**
   * GET request to stop stream on the server
   */
  $scope.stop = function () {

    $scope.trendsResource = $resource('/stream/stop');

    $scope.trendsResource.query( { }, function (res) {
      
    });
  }

  /**
   * GET request to start stream on the server
   */
  $scope.start = function () {

    $scope.trendsResource = $resource('/stream/start');

    $scope.trendsResource.query( { }, function (res) {
      
    });
  }

  $scope.init();

});
