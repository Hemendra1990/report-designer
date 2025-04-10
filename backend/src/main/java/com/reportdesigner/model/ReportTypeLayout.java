package com.reportdesigner.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.*;
import lombok.*;
import org.apache.commons.lang3.StringUtils;

import java.util.Locale;

@Entity
@Table(name = "rd_report_type_layout")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReportTypeLayout {

    @Id
    @Tsid
    @Column(length = 50)
    private String id;

    private String columnName;
    private String columnDisplayName;
    private String duckDBColumnName;
    private String duckDBColumnDisplayName;
    private String columnType;

    private String tableName;
    private String tableId;
    private Boolean active;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "report_type_id")
    @JsonBackReference
    private ReportType reportType;

    @PrePersist
    public void updateDuckDBColumnNames() {
        this.duckDBColumnName = String.format("%s_%s", tableName, columnName).toLowerCase();
        this.duckDBColumnDisplayName = StringUtils.capitalize(String.format("%s %s", tableName, columnDisplayName));
    }

}
