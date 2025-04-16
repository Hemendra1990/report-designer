package com.reportdesigner.multitenancy;

import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "schema_meta_data")
@Getter
@Setter
public class SchemaMetaData {
    @Id
    @Tsid
    @Column(length = 50)
    private String id;

    private String schemaName;
    private String url;
    private String username;
    private String password;
}