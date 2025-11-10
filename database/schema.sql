CREATE TABLE `artifacts` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '成果唯一标识',
  `project_id` bigint NOT NULL COMMENT '所属项目ID（逻辑关联项目服务的projects表）',
  `type` enum('PAPER','PATENT','CODE','DATASET','MODEL','REPORT') NOT NULL COMMENT '成果类型',
  `title` varchar(500) NOT NULL COMMENT '成果标题',
  `description` text COMMENT '成果描述',
  `doi` varchar(255) DEFAULT NULL COMMENT 'DOI编号',
  `journal` varchar(255) DEFAULT NULL COMMENT '发表期刊',
  `patent_number` varchar(100) DEFAULT NULL COMMENT '专利号',
  `dataset_version` varchar(50) DEFAULT NULL COMMENT '数据集版本',
  `custom_fields` json DEFAULT NULL COMMENT '自定义字段（JSON格式）',
  `status` enum('DRAFT','UNDER_REVIEW','PUBLISHED') DEFAULT 'DRAFT' COMMENT '成果状态',
  `created_by` bigint NOT NULL COMMENT '创建人ID（逻辑关联用户服务的users表）',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`) COMMENT '关联项目ID索引',
  KEY `idx_created_by` (`created_by`) COMMENT '关联创建人ID索引',
  KEY `idx_doi` (`doi`) COMMENT 'DOI索引',
  KEY `idx_patent_number` (`patent_number`) COMMENT '专利号索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='项目成果表（与项目服务、用户服务松耦合，通过ID逻辑关联）';

CREATE TABLE `permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '权限唯一标识',
  `name` varchar(100) NOT NULL COMMENT '权限名称（如：project:create、task:edit）',
  `description` text COMMENT '权限描述（如：创建项目权限、编辑任务权限）',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '更新时间',
  `updated_by` varchar(255) DEFAULT NULL,
  `version` int NOT NULL DEFAULT '0' COMMENT '版本号（乐观锁）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1977708283120717825 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统权限定义表（细粒度操作权限）';

CREATE TABLE `project_join_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '申请记录唯一标识',
  `project_id` bigint NOT NULL COMMENT '项目ID（逻辑关联projects表）',
  `user_id` bigint NOT NULL COMMENT '申请人ID（逻辑关联users表）',
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING' COMMENT '申请状态（待处理/已批准/已拒绝）',
  `message` text COMMENT '申请说明（申请人填写的加入理由）',
  `responded_at` timestamp NULL DEFAULT NULL COMMENT '处理时间',
  `responded_by` bigint DEFAULT NULL COMMENT '处理人ID（逻辑关联users表），处理人可以是项目负责人或管理员',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_id` (`project_id`,`user_id`,`status`) COMMENT '同一用户对同一项目的同一状态申请唯一',
  KEY `idx_project_status` (`project_id`,`status`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户加入项目的申请表';

CREATE TABLE `project_members` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '成员记录唯一标识',
  `project_id` bigint NOT NULL COMMENT '项目ID（逻辑关联projects表）',
  `user_id` bigint NOT NULL COMMENT '用户ID（逻辑关联users表）',
  `project_role` enum('LEADER','MAINTAINER','MEMBER') NOT NULL COMMENT '项目内角色（负责人/维护者/普通成员）',
  `permissions_override` json DEFAULT NULL COMMENT '权限覆盖（JSON格式，用于临时修改成员在项目内的权限）',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入项目时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_id` (`project_id`,`user_id`) COMMENT '确保用户不能重复加入同一项目',
  KEY `idx_project` (`project_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='项目成员关系表（记录用户在项目中的角色和权限）';

CREATE TABLE `projects` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '项目唯一标识',
  `name` varchar(200) NOT NULL COMMENT '项目名称',
  `description` text COMMENT '项目描述',
  `status` enum('PLANNING','ONGOING','COMPLETED','ARCHIVED') DEFAULT 'PLANNING' COMMENT '项目状态（规划中/进行中/已完成/已归档）',
  `visibility` enum('PUBLIC','PRIVATE') DEFAULT 'PRIVATE' COMMENT '项目可见性（公开/私有）',
  `start_date` date DEFAULT NULL COMMENT '项目开始日期',
  `end_date` date DEFAULT NULL COMMENT '项目结束日期',
  `created_by` bigint NOT NULL COMMENT '创建人ID（逻辑关联users表）',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='项目基本信息表';

CREATE TABLE `role_permissions` (
  `role_id` bigint NOT NULL COMMENT '角色ID（关联roles表，角色删除时级联删除此记录）',
  `permission_id` bigint NOT NULL COMMENT '权限ID（关联permissions表，权限删除时级联删除此记录）',
  `granted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '权限授予时间',
  `id` bigint NOT NULL COMMENT '关联记录唯一标识（雪花ID）',
  PRIMARY KEY (`role_id`,`permission_id`) COMMENT '复合主键（角色+权限唯一）',
  UNIQUE KEY `UK_ROLE_PERMISSION` (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色与权限的多对多关联表（角色继承权限，关联关系随角色/权限删除而自动删除）';

CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '角色唯一标识',
  `name` varchar(50) NOT NULL COMMENT '角色名称（如：ADMIN、USER）',
  `description` text COMMENT '角色描述（如：系统管理员、普通用户）',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '更新时间',
  `updated_by` varchar(255) DEFAULT NULL,
  `version` int NOT NULL DEFAULT '0' COMMENT '版本号（乐观锁）',
  `created_by` varchar(255) DEFAULT NULL,
  `is_system_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否为系统默认角色',
  `project_id` bigint DEFAULT NULL COMMENT '项目ID（项目角色时使用）',
  `role_type` varchar(20) NOT NULL COMMENT '角色类型（SYSTEM/PROJECT）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=1977907613203042305 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统角色定义表（用于权限分组）';

CREATE TABLE `tasks` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '任务唯一标识',
  `project_id` bigint NOT NULL COMMENT '所属项目ID（本服务内关联projects表）',
  `title` varchar(200) NOT NULL COMMENT '任务标题',
  `description` text COMMENT '任务描述',
  `status` enum('TODO','IN_PROGRESS','BLOCKED','DONE') DEFAULT 'TODO' COMMENT '任务状态（待办/进行中/阻塞/已完成）',
  `priority` enum('HIGH','MEDIUM','LOW') DEFAULT 'MEDIUM' COMMENT '任务优先级（高/中/低）',
  `assignee_id` json NOT NULL COMMENT '负责人ID（逻辑关联用户服务的用户ID，JSON类型存储多个负责人ID）',
  `due_date` date DEFAULT NULL COMMENT '任务截止日期',
  `created_by` bigint NOT NULL COMMENT '创建人ID（逻辑关联用户服务的用户ID）',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时\r\n间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `idx_created_by` (`created_by`) COMMENT '优化按创建人查询',
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='项目任务表（与用户服务松耦合，通过ID逻辑关联用户）';
CREATE TABLE `user_roles` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '关联记录唯一标识',
  `user_id` bigint NOT NULL COMMENT '用户ID（关联users表）',
  `role_id` bigint NOT NULL COMMENT '角色ID（关联roles表）',
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '角色分配时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`role_id`) COMMENT '确保用户不能重复关联同一角色',
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户与角色的多对多关联表';

CREATE TABLE `verification_codes` (
  `id` bigint NOT NULL COMMENT '验证码唯一标识（雪花ID）',
  `code` varchar(10) NOT NULL COMMENT '验证码',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `email` varchar(255) NOT NULL COMMENT '用户邮箱',
  `expires_at` datetime NOT NULL COMMENT '验证码过期时间',
  `is_used` tinyint(1) NOT NULL DEFAULT '0' COMMENT '验证码是否已使用',
  `type` varchar(20) NOT NULL COMMENT '验证码类型（REGISTER/RESET_PASSWORD/CHANGE_EMAIL）',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;