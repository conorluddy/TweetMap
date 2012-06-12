TweetMap
========

Twitter stream heat map experiment

This is a small application which stores tweets from the Twitter streaming API into a MySQL database table, where they can then be plotted on a google map to give a "heatmap" type result.

The Twitter stream is filtered by latitude and longitude, currently configured to return Tweets from Ireland.

Demo: http://suborganik.com/tweetmap/

========

To set up:

Create a database to hold the table in the setup\create.table.tweetstream.sql file

Enter your configuration details in lib\netConfig.php

Browse to [your url]/collector/streaming.php to kick off the stream, or set it up as a CRON job.

Go to your url and you should see the map updating in real time.

========