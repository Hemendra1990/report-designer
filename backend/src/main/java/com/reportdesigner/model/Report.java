package com.reportdesigner.model;

import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "rd_report")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Report extends BaseEntity {
    @Id
    @Tsid
    @Column(length = 50)
    private String id;
    
    private String name;
    private String label;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne
    @JoinColumn(name = "report_type_id")
    private ReportType reportType;
    
    // Store the basic SQL query (without grouping)
    @Column(columnDefinition = "TEXT")
    private String sqlQuery;
    
    // Store the SQL query with grouping applied
    @Column(columnDefinition = "TEXT") 
    private String sqlQueryWithGrouping;
    
    // References to configuration entities
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReportColumn> columns;
    
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReportGroup> groups;
    
    @OneToMany(mappedBy = "report", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReportFilter> filters;

    @Column(columnDefinition = "TEXT")
    private String filterRule;
    
    /*@OneToMany(mappedBy = "report", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReportPivot> pivots;*/
}