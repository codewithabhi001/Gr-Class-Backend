-- MySQL dump 10.13  Distrib 8.0.44, for macos15 (arm64)
--
-- Host: database-1.cdmaqckkenlv.ap-southeast-2.rds.amazonaws.com    Database: Gr_class_Prod
-- ------------------------------------------------------
-- Server version	8.4.7

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
-- SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
-- SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

-- SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Table structure for table `site_static_contents`
--

DROP TABLE IF EXISTS `site_static_contents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_static_contents` (
  `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `key` varchar(64) NOT NULL,
  `title` varchar(200) NOT NULL,
  `body_html` longtext,
  `faq_items` json DEFAULT NULL COMMENT 'Array of { question, answer, sort_order }',
  `news_items` json DEFAULT NULL COMMENT 'Array of { id, title, body_html, thumbnail_url, published_at }',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `site_static_contents_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_static_contents`
--

LOCK TABLES `site_static_contents` WRITE;
/*!40000 ALTER TABLE `site_static_contents` DISABLE KEYS */;
INSERT INTO `site_static_contents` VALUES ('0f41d4b0-fa90-4a18-a033-55e6db5826c8','about-us','About GR-Class – Excellence in Maritime Classification','\n<section style=\"line-height: 1.6; color: #333; font-family: sans-serif;\">\n    <h2 style=\"color: #0d233a; border-bottom: 2px solid #0d233a; padding-bottom: 8px;\">GR Class Services</h2>\n    <p>\n        GR Class welcomes you for your asset’s safety and compliances. GR Class is a Recognized Organization (RO), \n        Recognized Security Organization (RSO), and Classification Society (CS) authorised to offer statutory/class certification and services.\n    </p>\n    <p>\n        We are committed to ensuring the highest standards of safety, reliability, and environmental sustainability in the maritime industry. \n        Our team possesses strong technical expertise and professionalism, guaranteeing dedicated service to our clients.\n    </p>\n    <h3 style=\"color: #1b4f72; margin-top: 20px;\">Our Core Mission</h3>\n    <p>\n        Ensuring marine safety and safeguarding lives and property at sea through a comprehensive approach that combines international regulations \n        (e.g., SOLAS, ISPS Code), advanced surveillance, rigorous training, and risk management to protect lives, vessels, and the marine environment.\n    </p>\n    <hr style=\"border: 0; border-top: 1px solid #ddd; margin: 20px 0;\" />\n    <h3 style=\"color: #1b4f72;\">Capabilities & Technical Infrastructure</h3>\n    <p>\n        Being a classification society, our geographical presence along with certified surveyors makes GR Class technically strong and capable, \n        enhancing survey capabilities and ensuring standardised regulatory and compliance services.\n    </p>\n</section>\n                ',NULL,NULL,'2026-05-17 15:20:10','2026-05-17 15:20:10'),('32702c7f-cfd4-43f8-9aa9-8bef82b6c2ff','privacy','Privacy Policy','\n<section style=\"line-height: 1.6; color: #333; font-family: sans-serif;\">\n    <h2 style=\"color: #0d233a; border-bottom: 2px solid #0d233a; padding-bottom: 8px;\">Privacy & Data Protection Policy</h2>\n    <p><strong>Last Updated: May 17, 2026</strong></p>\n    <p>\n        At GR Class, we are committed to safeguarding the privacy and security of our clients\' data, including vessel blueprints, crew information, \n        and administrative credentials. This Privacy Policy details how we collect, process, and protect your information.\n    </p>\n    <h3 style=\"color: #1b4f72; margin-top: 20px;\">1. Information We Collect</h3>\n    <p>We collect structural vessel data, compliance documents, email addresses of operations personnel, and payment details during registration and service requests.</p>\n    <h3 style=\"color: #1b4f72; margin-top: 20px;\">2. Data Security & Storage</h3>\n    <p>GR Class implements advanced encryption, access-controlled databases, and regular security audits to protect sensitive operational files from unauthorized access.</p>\n</section>\n                ',NULL,NULL,'2026-05-17 15:20:11','2026-05-17 15:20:11'),('3a777582-8fb4-4279-ae5d-b14db5435096','faq','Frequently Asked Questions (FAQ)',NULL,'[{\"heading\": \"General & Classification\", \"questions\": [{\"answer\": \"As a Recognized Organization (RO) and Classification Society (CS), GR Class is authorized by various Flag Administrations to perform statutory surveys, verify safety compliance, and issue legal certificates in accordance with major international conventions like SOLAS, MARPOL, and Load Line.\", \"question\": \"What is the role of GR Class as a Recognized Organization (RO)?\"}, {\"answer\": \"Ship classification applications can be initiated online via the GR Class Portal. You will need to upload basic vessel dimensions, general plans, and operational history. Our technical experts will then review the data to proceed with the survey schedule.\", \"question\": \"How do I submit an application for ship classification?\"}]}, {\"heading\": \"Surveys & Audits\", \"questions\": [{\"answer\": \"If a deficiency is noted, our surveyor will issue a formal Condition of Class or Non-Conformity report. The vessel operator is provided with a realistic timeframe to perform rectifications, which are subsequently audited for compliance.\", \"question\": \"What happens if a surveyor identifies a deficiency during inspection?\"}, {\"answer\": \"Yes, GR Class supports remote surveys for certain minor vessel checks, checklist reviews, and documentation audits. You can coordinate this through the admin panel under remote survey requests.\", \"question\": \"Can I request a remote survey?\"}]}, {\"heading\": \"Certification & Compliance\", \"questions\": [{\"answer\": \"Yes, all certificates issued by GR Class are digitally signed and include secure QR codes. Port State Control (PSC), custom officers, and flag authorities can instantly verify certificate validity by scanning the QR code.\", \"question\": \"Are GR Class certificates digitally verifiable?\"}, {\"answer\": \"The GR Class system automatically tracks all certificates and sends automated email notifications to client managers at 90, 60, and 30 days prior to expiration to facilitate timely scheduling of annual or renewal surveys.\", \"question\": \"How are certificate expiry dates monitored?\"}]}]',NULL,'2026-05-17 15:20:12','2026-05-17 15:20:12'),('8f97781b-0d77-4096-acff-8867ace4215a','terms-compliance','Terms of Use & Compliance Standards','\n<section style=\"line-height: 1.6; color: #333; font-family: sans-serif;\">\n    <h2 style=\"color: #0d233a; border-bottom: 2px solid #0d233a; padding-bottom: 8px;\">Terms of Use & Compliance</h2>\n    <p><strong>Effective Date: May 17, 2026</strong></p>\n    <p>\n        These Terms govern all classification, statutory, and environmental survey services provided by GR Class to shipowners, charterers, and managers. \n        By scheduling a survey or utilizing our certificates, you agree to these conditions.\n    </p>\n    <h3 style=\"color: #1b4f72; margin-top: 20px;\">1. Standards of Performance</h3>\n    <p>\n        All surveys are conducted by certified GR Class surveyors with professional integrity. However, classification and certification do not relieve \n        the owner of their primary responsibility to maintain the vessel in a seaworthy condition.\n    </p>\n    <h3 style=\"color: #1b4f72; margin-top: 20px;\">2. Access to Vessels</h3>\n    <p>Shipowners must provide GR Class surveyors with safe, unobstructed access to the vessel, including dry-dock spaces, tanks, and structural compartments, along with complete technical documentation.</p>\n</section>\n                ',NULL,NULL,'2026-05-17 15:20:12','2026-05-17 15:20:12'),('a6d22aeb-0d1f-4919-ac31-260c65862638','news','Newsroom & Maritime Advisories','','[]','[{\"id\": \"news-01\", \"title\": \"GR Class Expands Middle East Operations\", \"body_html\": \"<p>GR Class is proud to announce the setup of its primary administrative operational hub in the Ajman District Business Hub. This geographic expansion increases survey responsiveness and capacity for Gulf and international clients.</p>\", \"published_at\": \"2026-04-27\", \"thumbnail_url\": \"https://cdn.grclass.com/documents/documents/582cfc7d-fa56-401b-8182-97455a3e6f3e-Flag_of_Panama.svg.png\"}, {\"id\": \"news-02\", \"title\": \"Adoption of IMO 2026 Environmental Standards\", \"body_html\": \"<p>In alignment with upcoming IMO targets, GR Class has rolled out a suite of technical environmental advisory services focusing on EEDI, EEXI, and CII compliance mapping for bulk carriers and tank fleets.</p>\", \"published_at\": \"2026-05-03\", \"thumbnail_url\": \"https://images.unsplash.com/photo-1505705694340-019e1e335916?w=500\"}, {\"id\": \"news-03\", \"title\": \"Digital Remote Surveyor Program Launched\", \"body_html\": \"<p>To optimize shipping schedules and reduce dry-docking costs, GR Class has officially rolled out its real-time digital remote surveyor program, leveraging secure streaming and checklist validation.</p>\", \"published_at\": \"2026-05-17\", \"thumbnail_url\": \"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500\"}, {\"title\": \"Military\", \"body_html\": \"<a class=\\\"headline\\\" href=\\\"https://gcaptain.com/military-jets-crew-members-safely-ejected-after-idaho-air-show-collision-navy-says/\\\" style=\\\"font-family: Lato, sans-serif; color: rgb(40, 47, 54); text-decoration: none; background-color: rgb(255, 255, 255); font-size: 16px;\\\"><h3 style=\\\"font-family: Lato, sans-serif; margin-top: 0px; margin-bottom: 0.5rem; line-height: 35px; font-size: 35px; color: rgb(40, 47, 54); padding: 15px 0px;\\\">Military Jets’ Crew Members Safely Ejected after Idaho Air Show Collision, Navy Says</h3></a><span style=\\\"color: rgb(33, 37, 41); font-family: Lato, sans-serif; font-size: 16px; background-color: rgb(255, 255, 255);\\\"></span><p style=\\\"font-family: Lato, sans-serif; margin-top: 0px; margin-bottom: 1rem; font-size: 20px; line-height: 20px; color: rgba(40, 47, 54, 0.8); background-color: rgb(255, 255, 255);\\\">Four crew members involved in a mid-air collision of military jets at an air show ejected safely on Sunday outside Mountain Home Air Force Base in Idaho, the</p>\", \"published_at\": \"2026-05-18\", \"thumbnail_url\": \"documents/documents/bdf2ef03-47cd-4611-bcc8-0a2d7594e7f3-2026-05-18T055251Z_1410411592_RC2HBLARIHQ7_RTRMADP_3_IDAHO-CRASH-2048x1366.jpg\"}]','2026-05-17 15:20:13','2026-05-18 10:50:43');
/*!40000 ALTER TABLE `site_static_contents` ENABLE KEYS */;
UNLOCK TABLES;
-- SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-19 18:27:03
