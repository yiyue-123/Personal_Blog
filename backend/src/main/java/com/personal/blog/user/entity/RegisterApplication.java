package com.personal.blog.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.personal.blog.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@TableName("t_user_register_application")
@EqualsAndHashCode(callSuper = true)
public class RegisterApplication extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private String nickname;
    private String avatar;
    private Integer status;
    private String reviewReason;
    private Long reviewBy;
    private LocalDateTime reviewTime;
}
