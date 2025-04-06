package com.reportdesigner.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(callSuper = true)
@EqualsAndHashCode(callSuper = true)
public class Report extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false)
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_type_id", nullable = false)
    private ReportType reportType;

    @Column(nullable = false)
    private String parameters;

    @Column(nullable = false)
    private String query;

    @Column(nullable = false)
    private String visualizationConfig;

    @Builder.Default
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Dashboard> dashboards = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private boolean isPublic = false;

    @Column(nullable = false)
    private String dataSource;

    @Column(nullable = false)
    private String refreshInterval;

    @Column(nullable = false)
    @Builder.Default
    private boolean autoRefresh = false;
} 