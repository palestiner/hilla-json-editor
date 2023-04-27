package com.palestiner.jsoneditor.dao;

import com.palestiner.jsoneditor.model.Json;
import org.springframework.data.repository.CrudRepository;

public interface JsonRepository extends CrudRepository<Json, String> {}
