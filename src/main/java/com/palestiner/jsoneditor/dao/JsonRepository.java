package com.palestiner.jsoneditor.dao;

import com.palestiner.jsoneditor.model.Json;
import org.springframework.data.repository.ListCrudRepository;

import java.util.List;

public interface JsonRepository extends ListCrudRepository<Json, String> {

    List<Json> findAllByName(String name);

}
