package com.klu.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Role {
    ADMIN,
    USER;

    @JsonValue
    public String toJson() {
        return name();
    }

    @JsonCreator
    public static Role fromJson(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Role.valueOf(value.trim().toUpperCase());
    }
}
