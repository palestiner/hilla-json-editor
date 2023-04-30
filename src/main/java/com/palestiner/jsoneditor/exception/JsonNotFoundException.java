package com.palestiner.jsoneditor.exception;

public class JsonNotFoundException extends RuntimeException {

    public JsonNotFoundException(JsonId id) {
        super("Json with id %s not found".formatted(id.id));
    }

    public JsonNotFoundException(String msg) {
        super(msg);
    }

    public record JsonId(String id) {}

}
