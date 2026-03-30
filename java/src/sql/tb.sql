/*
 Navicat Premium Dump SQL

 Source Server         : 测试8.160.179.187
 Source Server Type    : MySQL
 Source Server Version : 90001 (9.0.1)
 Source Host           : 8.160.179.187:3309
 Source Schema         : tb

 Target Server Type    : MySQL
 Target Server Version : 90001 (9.0.1)
 File Encoding         : 65001

 Date: 30/03/2026 10:47:34
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for attachment
-- ----------------------------
DROP TABLE IF EXISTS `attachment`;
CREATE TABLE `attachment`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `source_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '来源类型（如：task, reply, comment, project）',
  `source_id` bigint NOT NULL DEFAULT 0 COMMENT '来源记录ID',
  `file_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '原始文件名',
  `file_path` varchar(1024) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文件存储路径或URL（如MinIO/OSS地址）',
  `file_size` int UNSIGNED NOT NULL COMMENT '文件大小（字节）',
  `mime_type` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'MIME类型，如 image/jpeg',
  `create_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '上传人ID',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  `is_deleted` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '逻辑删除标志',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_source`(`source_type` ASC, `source_id` ASC) USING BTREE,
  INDEX `idx_upload_by_time`(`create_by` ASC, `create_time` ASC) USING BTREE,
  INDEX `idx_upload_time`(`create_time` ASC) USING BTREE,
  INDEX `idx_file_size`(`file_size` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 176 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '通用附件表（多态关联）' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `task_id` bigint NOT NULL COMMENT '关联的任务ID',
  `parent_id` bigint NULL DEFAULT 0 COMMENT '父评论ID',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '评论内容（支持Markdown）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '创建人',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_task_id`(`task_id` ASC) USING BTREE COMMENT '任务ID索引'
) ENGINE = InnoDB AUTO_INCREMENT = 75 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '任务评论表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for component
-- ----------------------------
DROP TABLE IF EXISTS `component`;
CREATE TABLE `component`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `label` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '组件显示名称，如：下拉选择框',
  `component_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '组件唯一标识，如：select、input、date-picker',
  `has_action_buttons` tinyint(1) NULL DEFAULT 0 COMMENT '是否需要操作列（如编辑/删除按钮），0-否，1-是',
  `props_config` json NULL COMMENT '组件默认属性配置（JSON格式，如 { \"multiple\": true, \"placeholder\": \"请选择\" }）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_component_key`(`component_key` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 35 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '前端动态表单组件类型配置表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for document
-- ----------------------------
DROP TABLE IF EXISTS `document`;
CREATE TABLE `document`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `project_id` int NOT NULL COMMENT '项目ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文档标题',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '文档描述（可选）',
  `document_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '其他' COMMENT '文档类型（如：技术方案、需求文档等）',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '文档内容（HTML 或 Markdown）',
  `status` enum('draft','published','archived') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'draft' COMMENT '文档状态：草稿/已发布/已归档',
  `create_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '创建人ID（如用户ID）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint(1) NULL DEFAULT 0 COMMENT '逻辑删除标志：0=正常，1=已删除',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_create_by`(`create_by` ASC) USING BTREE,
  INDEX `idx_status`(`status` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE,
  INDEX `idx_title`(`title` ASC) USING BTREE,
  FULLTEXT INDEX `idx_content`(`content`) COMMENT '全文索引，用于搜索文档内容'
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '文档主表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for dynamic
-- ----------------------------
DROP TABLE IF EXISTS `dynamic`;
CREATE TABLE `dynamic`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL DEFAULT NULL,
  `task_id` int NULL DEFAULT NULL,
  `description` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `created_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '创建动态表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for menu
-- ----------------------------
DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu`  (
  `menu_id` bigint NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `menu_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '菜单名称',
  `parent_id` bigint NULL DEFAULT 0 COMMENT '父菜单ID',
  `order_num` int NULL DEFAULT 0 COMMENT '显示顺序',
  `path` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '路由地址',
  `component` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '组件路径',
  `query` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '路由参数',
  `route_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '路由名称',
  `is_frame` int NULL DEFAULT 1 COMMENT '是否为外链（0是 1否）',
  `is_cache` int NULL DEFAULT 0 COMMENT '是否缓存（0缓存 1不缓存）',
  `menu_type` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '菜单类型（M目录 C菜单 F按钮）',
  `visible` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '菜单状态（0显示 1隐藏）',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '菜单状态（0正常 1停用）',
  `perms` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '权限标识',
  `icon` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '#' COMMENT '菜单图标',
  `create_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`menu_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '菜单权限表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for msg_event_remind
-- ----------------------------
DROP TABLE IF EXISTS `msg_event_remind`;
CREATE TABLE `msg_event_remind`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL COMMENT '被提醒用户ID',
  `sender_id` bigint UNSIGNED NOT NULL COMMENT '触发用户ID',
  `event_type` tinyint NOT NULL COMMENT '事件类型：1=点赞，2=评论，3=关注，4=转发，5=@提及',
  `target_type` tinyint NOT NULL COMMENT '目标类型：1= 视频 任务 ，2=动态，3=评论，4=专栏',
  `target_id` bigint UNSIGNED NOT NULL COMMENT '目标资源ID target_id = 3008 → 评论 3008',
  `summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL COMMENT '摘要（如评论内容截断）',
  `jump_url` varchar(512) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '跳转链接（前端直接使用）',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_time` datetime NULL DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_user_unread_ctime`(`user_id` ASC, `is_read` ASC, `create_time` ASC) USING BTREE,
  INDEX `idx_target`(`target_type` ASC, `target_id` ASC) USING BTREE,
  INDEX `idx_sender`(`sender_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 27 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户事件提醒（互动类通知）' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for msg_private_chat
-- ----------------------------
DROP TABLE IF EXISTS `msg_private_chat`;
CREATE TABLE `msg_private_chat`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_a` bigint UNSIGNED NOT NULL COMMENT '用户A（ID较小者）',
  `user_b` bigint UNSIGNED NOT NULL COMMENT '用户B（ID较大者）',
  `latest_msg_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '最新消息ID',
  `unread_a` int UNSIGNED NOT NULL DEFAULT 0 COMMENT 'user_a 的未读数',
  `unread_b` int UNSIGNED NOT NULL DEFAULT 0 COMMENT 'user_b 的未读数',
  `last_active_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_users`(`user_a` ASC, `user_b` ASC) USING BTREE,
  INDEX `idx_user_a_active`(`user_a` ASC, `last_active_time` ASC) USING BTREE,
  INDEX `idx_user_b_active`(`user_b` ASC, `last_active_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '私信会话（两人对话容器）' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for msg_private_message
-- ----------------------------
DROP TABLE IF EXISTS `msg_private_message`;
CREATE TABLE `msg_private_message`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `chat_id` bigint UNSIGNED NOT NULL COMMENT '所属会话ID',
  `sender_id` bigint UNSIGNED NOT NULL,
  `receiver_id` bigint UNSIGNED NOT NULL,
  `msg_type` tinyint NOT NULL DEFAULT 1 COMMENT '1=文本，2=图片，3=文件，4=语音',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息内容（文本或JSON结构化数据）',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_time` datetime NULL DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_chat_ctime`(`chat_id` ASC, `create_time` ASC) USING BTREE,
  INDEX `idx_receiver_unread`(`receiver_id` ASC, `is_read` ASC, `create_time` ASC) USING BTREE,
  INDEX `idx_sender`(`sender_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '私信消息内容' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for msg_system_notice
-- ----------------------------
DROP TABLE IF EXISTS `msg_system_notice`;
CREATE TABLE `msg_system_notice`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '通知正文',
  `notice_type` tinyint NOT NULL DEFAULT 0 COMMENT '通知类型：0=系统公告，1=活动推送，2=安全提醒',
  `target_type` tinyint NOT NULL DEFAULT 0 COMMENT '目标类型：0=全体用户，1=指定用户',
  `target_user_id` bigint UNSIGNED NULL DEFAULT NULL COMMENT '目标用户ID（仅当 target_type=1 时有效）',
  `status` tinyint NOT NULL DEFAULT 0 COMMENT '分发状态：0=待分发，1=已分发',
  `plan_push_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '计划推送时间（用于新用户补推）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_status_plan`(`status` ASC, `plan_push_time` ASC) USING BTREE,
  INDEX `idx_target`(`target_type` ASC, `target_user_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 18 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '系统通知模板（由管理员创建）' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for msg_user_notice
-- ----------------------------
DROP TABLE IF EXISTS `msg_user_notice`;
CREATE TABLE `msg_user_notice`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL COMMENT '接收用户ID',
  `notice_id` bigint UNSIGNED NOT NULL COMMENT '关联 msg_system_notice.id',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '冗余：标题',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '冗余：内容',
  `is_read` tinyint(1) NOT NULL DEFAULT 0 COMMENT '0=未读，1=已读',
  `read_time` datetime NULL DEFAULT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_user_notice`(`user_id` ASC, `notice_id` ASC) USING BTREE COMMENT '防止重复投递',
  INDEX `idx_user_unread`(`user_id` ASC, `is_read` ASC, `create_time` ASC) USING BTREE,
  INDEX `idx_notice_id`(`notice_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '用户接收到的系统通知' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for permission
-- ----------------------------
DROP TABLE IF EXISTS `permission`;
CREATE TABLE `permission`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `permission` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '权限标识',
  `permission_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '权限名称',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for permission_relation
-- ----------------------------
DROP TABLE IF EXISTS `permission_relation`;
CREATE TABLE `permission_relation`  (
  `id` int NOT NULL,
  `role_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project
-- ----------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_id` int NULL DEFAULT 0 COMMENT '父项目ID，NULL表示无父项目',
  `owner` int NULL DEFAULT NULL COMMENT '拥有者',
  `project_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '项目名称',
  `pic_addr` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '项目封面图片地址（URL或相对路径）',
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '1' COMMENT '1可见0不可见',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '描述',
  `invite_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '邀请码',
  `create_by` bigint NULL DEFAULT NULL COMMENT '创建人',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` bigint NULL DEFAULT NULL COMMENT '更新者',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `is_deleted` varchar(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 104 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for project_role
-- ----------------------------
DROP TABLE IF EXISTS `project_role`;
CREATE TABLE `project_role`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NULL DEFAULT NULL,
  `role_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 104 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for role_menu
-- ----------------------------
DROP TABLE IF EXISTS `role_menu`;
CREATE TABLE `role_menu`  (
  `role_id` bigint NOT NULL COMMENT '角色ID',
  `menu_id` bigint NOT NULL COMMENT '菜单ID',
  PRIMARY KEY (`role_id`, `menu_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '角色和菜单关联表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for role_user
-- ----------------------------
DROP TABLE IF EXISTS `role_user`;
CREATE TABLE `role_user`  (
  `role_id` bigint NOT NULL,
  `user_id` bigint NOT NULL
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `role_id` bigint NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '角色名称',
  `role_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '角色权限字符串',
  `role_sort` int NULL DEFAULT NULL COMMENT '显示顺序',
  `data_scope` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '1' COMMENT '数据范围（1：全部数据权限 2：自定数据权限 3：本部门数据权限 4：本部门及以下数据权限）',
  `menu_check_strictly` tinyint(1) NULL DEFAULT 1 COMMENT '菜单树选择项是否关联显示',
  `dept_check_strictly` tinyint(1) NULL DEFAULT 1 COMMENT '部门树选择项是否关联显示',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '角色状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`role_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 103 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '角色信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for serial_sequence
-- ----------------------------
DROP TABLE IF EXISTS `serial_sequence`;
CREATE TABLE `serial_sequence`  (
  `biz_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_cs NOT NULL COMMENT '业务类型，如 TASK, REQUIREMENT',
  `project_id` int NOT NULL COMMENT '项目ID',
  `scope_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_bg_0900_as_cs NOT NULL COMMENT '作用域标识，如 project_101, global',
  `current_value` int NOT NULL DEFAULT 0 COMMENT '当前序号',
  PRIMARY KEY (`biz_type`, `scope_key`, `project_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '通用编号序列' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for shortcut
-- ----------------------------
DROP TABLE IF EXISTS `shortcut`;
CREATE TABLE `shortcut`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `project_id` int NULL DEFAULT NULL,
  `user_id` int NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = ' 创建捷径表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for sys_dept
-- ----------------------------
DROP TABLE IF EXISTS `sys_dept`;
CREATE TABLE `sys_dept`  (
  `dept_id` bigint NOT NULL AUTO_INCREMENT COMMENT '部门id',
  `parent_id` bigint NULL DEFAULT 0 COMMENT '父部门id',
  `ancestors` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '祖级列表',
  `dept_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '部门名称',
  `order_num` int NULL DEFAULT 0 COMMENT '显示顺序',
  `leader` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '负责人',
  `phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '联系电话',
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '邮箱',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '部门状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`dept_id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '部门表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `dept_id` bigint NULL DEFAULT NULL COMMENT '部门ID',
  `user_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户账号',
  `nick_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '用户昵称',
  `user_type` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '00' COMMENT '用户类型（00系统用户）',
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '' COMMENT '用户邮箱',
  `phonenumber` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '手机号码',
  `sex` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '用户性别（0男 1女 2未知）',
  `avatar` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '头像地址',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '' COMMENT '密码',
  `status` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '帐号状态（0正常 1停用）',
  `del_flag` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `login_ip` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '最后登录IP',
  `login_date` datetime NULL DEFAULT NULL COMMENT '最后登录时间',
  `create_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '创建者',
  `create_time` datetime NULL DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '更新者',
  `update_time` datetime NULL DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 34 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户信息表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for task
-- ----------------------------
DROP TABLE IF EXISTS `task`;
CREATE TABLE `task`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '任务主键ID',
  `task_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '任务编号，如 TASK-0001',
  `task_type_id` int NOT NULL COMMENT '任务类型ID',
  `project_id` int NOT NULL COMMENT '项目ID',
  `tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '任务标签，多个用英文逗号分隔',
  `task_title` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '任务名称',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '任务描述',
  `priority` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '优先级（高/中/低）',
  `assigner` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '甲',
  `observers` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '任务观察者列表，多个用户ID用英文逗号分隔，如 \"1001,1002,1003\"，用于存储有只读权限的用户ID',
  `assignee` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '乙',
  `completion_percentage` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '任务完成百分比（0～100）',
  `estimated_hours` decimal(10, 2) NULL DEFAULT 0.00 COMMENT '预估工时(小时)',
  `status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '任务状态',
  `start_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '任务开始时间',
  `actual_finish_time` datetime NULL DEFAULT NULL COMMENT '实际完成时间（任务真正结束的时间）',
  `due_date` datetime NULL DEFAULT NULL COMMENT '截止时间',
  `is_deleted` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0',
  `create_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '创建人',
  `update_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '更新人',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_task_type`(`task_type_id` ASC) USING BTREE,
  INDEX `fk_project`(`project_id` ASC) USING BTREE,
  CONSTRAINT `fk_project` FOREIGN KEY (`project_id`) REFERENCES `project` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_task_type` FOREIGN KEY (`task_type_id`) REFERENCES `task_type` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 220 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '任务主表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for task_field_values
-- ----------------------------
DROP TABLE IF EXISTS `task_field_values`;
CREATE TABLE `task_field_values`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `tasks_id` int NULL DEFAULT NULL,
  `field_id` int NULL DEFAULT NULL,
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 213 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '创建字段值表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for task_fields
-- ----------------------------
DROP TABLE IF EXISTS `task_fields`;
CREATE TABLE `task_fields`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `task_type_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '字段标识符（英文，如 assignee）',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '组件类型，对应 component.component_key',
  `label` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '字段显示名称',
  `is_required` tinyint(1) NULL DEFAULT 1 COMMENT '是否必填：1-是，0-否',
  `is_hidden` tinyint(1) NULL DEFAULT 0 COMMENT '是否隐藏',
  `options` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '静态选项（仅适用于 select/radio 等）',
  `config_override` json NULL COMMENT '覆盖 component 的默认配置',
  `sort` int NULL DEFAULT 0,
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_task_type_name`(`task_type_id` ASC, `name` ASC) USING BTREE,
  INDEX `idx_task_type_id`(`task_type_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 88 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '任务模板字段定义表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for task_relation
-- ----------------------------
DROP TABLE IF EXISTS `task_relation`;
CREATE TABLE `task_relation`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `parent_task_id` int NOT NULL COMMENT '父任务ID',
  `child_task_id` int NOT NULL COMMENT '子任务ID',
  `relation_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '关系类型（可选，如：DEPENDS_ON, INCLUDES 等）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '创建人',
  `is_deleted` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '0',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_parent_child_new`(`parent_task_id` ASC, `child_task_id` ASC) USING BTREE,
  INDEX `idx_child_task`(`child_task_id` ASC) USING BTREE,
  INDEX `idx_parent_task`(`parent_task_id` ASC) USING BTREE,
  CONSTRAINT `fk_child_task` FOREIGN KEY (`child_task_id`) REFERENCES `task` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 141 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '任务多对多父子关系表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for task_type
-- ----------------------------
DROP TABLE IF EXISTS `task_type`;
CREATE TABLE `task_type`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `project_id` int NULL DEFAULT NULL COMMENT ' null 表示全局模板',
  `is_hidden` tinyint NULL DEFAULT 0 COMMENT '是否隐藏：true 1   false 0',
  `create_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` int NULL DEFAULT 0 COMMENT '逻辑删除 默认是 0',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 62 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '创建任务类型表如任务  风险 缺陷等' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for update_log
-- ----------------------------
DROP TABLE IF EXISTS `update_log`;
CREATE TABLE `update_log`  (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `table_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '表名，如user',
  `record_id` bigint UNSIGNED NOT NULL COMMENT '记录ID，如user.id',
  `field_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '变更的字段名，如age',
  `old_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '旧值',
  `new_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '新值',
  `operation_type` enum('INSERT','UPDATE','DELETE','TRANSFER') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '操作类型',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '操作说明（可选，用于补充操作背景或变更原因）',
  `create_by` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '操作人',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_table_record_time`(`table_name` ASC, `record_id` ASC, `create_time` ASC) USING BTREE,
  INDEX `idx_create_by_time`(`create_by` ASC, `create_time` ASC) USING BTREE,
  INDEX `idx_create_time`(`create_time` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 401 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '字段更新日志表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for workflow
-- ----------------------------
DROP TABLE IF EXISTS `workflow`;
CREATE TABLE `workflow`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '工作流名称',
  `code` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '唯一编码，用于系统识别（如 TASK_APPROVAL）',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `project_id` int NULL DEFAULT NULL COMMENT '所属项目，NULL 表示全局',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT '是否启用：1-是，0-否',
  `version` int NULL DEFAULT 1 COMMENT '版本号，用于灰度或历史追溯',
  `is_default` tinyint(1) NULL DEFAULT 0 COMMENT '是否为该项目的默认工作流',
  `create_by` int NULL DEFAULT NULL,
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_code_version`(`code` ASC, `version` ASC) USING BTREE,
  INDEX `idx_project`(`project_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '工作流定义' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for workflow_copy1
-- ----------------------------
DROP TABLE IF EXISTS `workflow_copy1`;
CREATE TABLE `workflow_copy1`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `user_id` int NULL DEFAULT NULL,
  `project_id` int NULL DEFAULT NULL,
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '创建工作流' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for workflow_history
-- ----------------------------
DROP TABLE IF EXISTS `workflow_history`;
CREATE TABLE `workflow_history`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `instance_id` int NOT NULL COMMENT '关联的流程实例ID（workflow_instance.id）',
  `from_node_id` int NULL DEFAULT NULL COMMENT '来源节点ID（workflow_node.id），NULL 表示流程启动（无前驱节点）',
  `to_node_id` int NOT NULL COMMENT '目标节点ID（workflow_node.id）',
  `operator_id` int NULL DEFAULT NULL COMMENT '操作人用户ID（system_user.id），NULL 表示系统自动流转',
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '操作动作标识（如 approve, reject, submit, auto_pass）',
  `comment` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '审批意见或备注',
  `operate_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作发生时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_instance`(`instance_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '工作流历史记录表：记录流程每一步的流转轨迹' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for workflow_instance
-- ----------------------------
DROP TABLE IF EXISTS `workflow_instance`;
CREATE TABLE `workflow_instance`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `workflow_id` int NOT NULL COMMENT '关联的工作流模板ID（workflow.id）',
  `business_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '业务类型（如 task, defect, risk, requirement）',
  `business_id` int NOT NULL COMMENT '关联的业务实体ID（如 task.id）',
  `current_node_id` int NULL DEFAULT NULL COMMENT '当前所在节点ID（workflow_node.id），NULL 表示尚未开始或已结束',
  `status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'running' COMMENT '流程状态：running（进行中）/ completed（已完成）/ terminated（已终止）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '流程实例创建时间',
  `end_time` datetime NULL DEFAULT NULL COMMENT '流程结束时间（仅当 status != running 时有值）',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_business`(`business_type` ASC, `business_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '工作流实例表：记录每个业务对象对应的流程执行状态' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for workflow_node
-- ----------------------------
DROP TABLE IF EXISTS `workflow_node`;
CREATE TABLE `workflow_node`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `workflow_id` int NOT NULL,
  `node_key` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '节点唯一标识（如 submit, approve, close）',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '节点显示名称',
  `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'manual' COMMENT '节点类型：manual-人工处理, auto-自动执行, condition-条件分支',
  `assign_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'role' COMMENT '指派方式：user-指定用户, role-角色, dept-部门, script-脚本计算',
  `assign_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '指派值（如角色ID、用户ID、脚本表达式）',
  `is_start` tinyint(1) NULL DEFAULT 0 COMMENT '是否为开始节点',
  `is_end` tinyint(1) NULL DEFAULT 0 COMMENT '是否为结束节点',
  `sort_order` int NULL DEFAULT 0 COMMENT '排序权重',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_workflow_node_key`(`workflow_id` ASC, `node_key` ASC) USING BTREE,
  INDEX `idx_workflow`(`workflow_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '工作流节点' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for workflow_node_copy1
-- ----------------------------
DROP TABLE IF EXISTS `workflow_node_copy1`;
CREATE TABLE `workflow_node_copy1`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `workflow_id` int NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `phase` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '工作流默认的状态：开始状态（start） 进行状态（progress） 结束状态（close）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '创建工作流节点' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for workflow_node_turnover_copy1
-- ----------------------------
DROP TABLE IF EXISTS `workflow_node_turnover_copy1`;
CREATE TABLE `workflow_node_turnover_copy1`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `workflow_id` int NULL DEFAULT NULL,
  `start_workflow_node` int NULL DEFAULT NULL,
  `end_workflow_node` int NULL DEFAULT NULL,
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '创建工作流节点流转' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for workflow_transition
-- ----------------------------
DROP TABLE IF EXISTS `workflow_transition`;
CREATE TABLE `workflow_transition`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `workflow_id` int NOT NULL,
  `from_node_id` int NOT NULL COMMENT '源节点ID',
  `to_node_id` int NOT NULL COMMENT '目标节点ID',
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '流转名称（如“同意”、“驳回”）',
  `condition_expr` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '流转条件表达式（如 ${task.priority} == \"high\"）',
  `action_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'normal' COMMENT '操作类型：normal-普通, rollback-回退, jump-跳转',
  `is_auto` tinyint(1) NULL DEFAULT 0 COMMENT '是否自动流转（无需人工操作）',
  `sort_order` int NULL DEFAULT 0,
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_workflow`(`workflow_id` ASC) USING BTREE,
  INDEX `idx_from_to`(`from_node_id` ASC, `to_node_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '工作流节点流转规则' ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
