package com.reportdesigner.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "widgets")
@Getter
@Setter
public class Widget extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dashboard_id", nullable = false)
    private Dashboard dashboard;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id", nullable = false)
    private Report report;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String configuration;

    @Column(nullable = false)
    private String position;

    @Column(nullable = false)
    private String size;

    @Column(nullable = false)
    private String refreshInterval;

    @Column(nullable = false)
    private boolean autoRefresh = false;

    @Column(nullable = false)
    private String filters;

    @Column(nullable = false)
    private String style;
} 