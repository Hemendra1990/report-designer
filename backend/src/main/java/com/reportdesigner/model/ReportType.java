package com.reportdesigner.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "report_types")
@Getter
@Setter
public class ReportType extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, unique = true)
    private String name;

    @Size(max = 500)
    private String description;

    @Column(nullable = false)
    private String queryTemplate;

    @Column(nullable = false)
    private String parametersSchema;

    @OneToMany(mappedBy = "reportType", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Report> reports = new ArrayList<>();

    @Column(nullable = false)
    private boolean isPublic = false;

    @Column(nullable = false)
    private String dataSource;

    @Column(nullable = false)
    private String visualizationOptions;
} 