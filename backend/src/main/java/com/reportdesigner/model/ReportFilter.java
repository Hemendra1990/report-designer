package com.reportdesigner.model;

import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "rd_report_filter")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportFilter extends BaseEntity {
    @Id
    @Tsid
    @Column(length = 50)
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "report_id")
    private Report report;
    
    private String tableName;
    private String columnName;
    private String duckDBColumnName;
    private String operator; // equals, contains, greater than, etc.
    
    @Column(columnDefinition = "TEXT")
    private String value;
    
    private Integer sortOrder;
    private String logicalOperator; // AND, OR
    
    // For custom formula filters
    @Column(columnDefinition = "TEXT")
    private String customFormula;
}