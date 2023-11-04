package com.palestiner.jsoneditor.model;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.index.Indexed;

import java.io.Serializable;

@Getter
@Setter
@RedisHash("json")
public class Json implements Serializable {

    @Id
    private String id;

    @Indexed
    @NotNull
    private String name;

    private boolean disabled = false;

    @NotNull
    private String content;

    public Json() {
    }

    public Json(String name, String content) {
        this(name, content, false);
    }

    public Json(String name, String content, boolean disabled) {
        this.name = name;
        this.disabled = disabled;
        this.content = content;
    }

}
