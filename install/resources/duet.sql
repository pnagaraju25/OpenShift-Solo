SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;




CREATE TABLE IF NOT EXISTS `activity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `object_type` varchar(20) NOT NULL,
  `object_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action_taken` varchar(20) NOT NULL,
  `object_title` varchar(100) NOT NULL,
  `linked_object_type` varchar(20) NOT NULL,
  `linked_object_id` int(11) NOT NULL,
  `linked_object_title` varchar(100) NOT NULL,
  `activity_date` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



CREATE TABLE IF NOT EXISTS `clients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(400) NOT NULL,
  `email` varchar(100) NOT NULL,
  `address1` varchar(100) NOT NULL,
  `address2` varchar(100) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `website` varchar(50) NOT NULL,
  `primary_contact_id` int(11) NOT NULL,
  `is_archived` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



CREATE TABLE IF NOT EXISTS `files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `uploader_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `entity_type` mediumtext,
  `entity_id` int(11) DEFAULT NULL,
  `notes` mediumtext NOT NULL,
  `type` varchar(10) NOT NULL,
  `size` int(11) NOT NULL,
  `created` int(11) NOT NULL,
  `is_archived` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;




CREATE TABLE IF NOT EXISTS `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message` mediumtext NOT NULL,
  `user_id` int(11) NOT NULL,
  `reference_object` varchar(15) NOT NULL,
  `reference_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `client_id` int(11) NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `created_date` int(11) NOT NULL,
  `is_archived` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;




CREATE TABLE IF NOT EXISTS `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(400) NOT NULL,
  `client_id` int(11) NOT NULL,
  `start_date` int(11) NOT NULL,
  `due_date` int(11) DEFAULT NULL,
  `progress` int(11) NOT NULL,
  `expected_progress` int(11) NOT NULL,
  `file_folder` varchar(50) NOT NULL,
  `status_text` varchar(20) NOT NULL,
  `created_date` int(11) NOT NULL,
  `is_archived` tinyint(4) NOT NULL,
  `is_template` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



CREATE TABLE IF NOT EXISTS `project_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `notes` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;





CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(40) NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `ip_address` varchar(16) NOT NULL,
  `user_agent` varchar(50) NOT NULL,
  `last_activity` int(10) unsigned NOT NULL,
  PRIMARY KEY (`session_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



CREATE TABLE IF NOT EXISTS `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `section` varchar(100) NOT NULL,
  `name` varchar(50) NOT NULL,
  `value` varchar(1000) NOT NULL,
  `type` varchar(10) NOT NULL,
  `description` text NOT NULL,
  `default_value` varchar(1000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task` mediumtext NOT NULL,
  `notes` mediumtext NOT NULL,
  `project_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `is_complete` tinyint(1) NOT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `order` int(11) NOT NULL,
  `due_date` int(11) DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `status_text` varchar(20) DEFAULT NULL,
  `is_overdue` tinyint(4) NOT NULL,
  `is_section` tinyint(4) NOT NULL,
  `is_invoiced` tinyint(4) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `completed_by` int(11) NOT NULL,
  `completed_date` int(11) DEFAULT NULL,
  `created_date` int(11) NOT NULL,
  `total_time` int(11) NOT NULL,
  `modified_date` int(11) NOT NULL,
  `is_archived` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



CREATE TABLE IF NOT EXISTS `time_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `time` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start_date` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `first_name` varchar(400) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(100) NOT NULL,
  `address1` varchar(100) NOT NULL,
  `address2` varchar(100) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `temp_password` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


INSERT INTO `users` (`id`, `client_id`, `first_name`, `last_name`, `email`, `address1`, `address2`, `phone`, `password`, `salt`, `temp_password`) VALUES
(1, 0, 'Sample', 'Admin', 'admin', '', '', '', '42e8e8061bd17e8d1b5b7220251d0d396a1250d962796199050307107f85b2e7', '312ffb9033bc186578bc085954a7894df47f591a7f760c69df35ff878a8006a9', '');

INSERT INTO `projects` (`id`, `name`, `client_id`, `start_date`, `due_date`, `progress`, `expected_progress`, `file_folder`, `status_text`, `created_date`, `is_archived`) VALUES
(1, 'Sample Project', 1, 1430192436, 1432784436, 0, 0, '', 'on-schedule', 0, 0);

INSERT INTO `clients` (`id`, `name`, `email`, `address1`, `address2`, `phone`, `website`, `primary_contact_id`, `is_archived`) VALUES
(1, 'Sample Client', 'client@example.com', '123 Fern St', 'Atlanta GA', '111-111-1111', 'www.google.com', 0, 0);


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;