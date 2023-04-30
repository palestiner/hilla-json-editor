package com.palestiner.jsoneditor.endpoint;

import com.palestiner.jsoneditor.dao.JsonRepository;
import com.palestiner.jsoneditor.exception.JsonNotFoundException;
import com.palestiner.jsoneditor.exception.JsonNotFoundException.JsonId;
import com.palestiner.jsoneditor.model.Json;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import dev.hilla.Endpoint;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.function.Supplier;

@Endpoint
@AnonymousAllowed
public class JsonEndpoint {

    private final JsonRepository jsonRepository;

    public JsonEndpoint(JsonRepository jsonRepository) {
        this.jsonRepository = jsonRepository;
    }

    public List<Json> findAll() {
        return jsonRepository.findAll();
    }

    public Json findById(String id) {
        return jsonRepository.findById(id)
                .orElseThrow(jsonNotFoundExceptionSupplier(id));
    }

    public Json save(String name, String content) {
        return jsonRepository.save(new Json(name, content));
    }

    public List<Json> findByName(String name) {
        return jsonRepository.findAllByName(name);
    }

    public void deleteJsons(List<Json> jsons) {
        jsonRepository.deleteAll(jsons);
    }

    @Transactional
    public Json update(Json jsonForUpdate) {
        String id = jsonForUpdate.getId();
        return jsonRepository.findById(id)
                .map(json -> {
                    json.setName(jsonForUpdate.getName());
                    json.setContent(jsonForUpdate.getContent());
                    jsonRepository.save(json);
                    return json;
                })
                .orElseThrow(jsonNotFoundExceptionSupplier(id));
    }

    private static Supplier<JsonNotFoundException> jsonNotFoundExceptionSupplier(String id) {
        return () -> new JsonNotFoundException(new JsonId(id));
    }

}
