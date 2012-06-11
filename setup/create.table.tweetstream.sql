
--
-- Table structure for table `tweetstream`
--

DROP TABLE IF EXISTS `tweetstream`;
CREATE TABLE IF NOT EXISTS `tweetstream` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `text` varchar(150) NOT NULL,
  `screen_name` varchar(255) NOT NULL,
  `latitude` varchar(12) NOT NULL,
  `longitude` varchar(12) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=19163 ;
