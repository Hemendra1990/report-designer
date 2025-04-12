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
@Table(name = "rd_report_column")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReportColumn extends BaseEntity {
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
    private String displayName;
    private Integer sortOrder;
    private Boolean visible;
    private String aggregationType; // SUM, AVG, COUNT, etc.
}