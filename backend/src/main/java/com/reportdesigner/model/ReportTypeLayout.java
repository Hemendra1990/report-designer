package com.reportdesigner.model;

import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.*;
import lombok.*;

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
    private String columnType;

    private String tableName;
    private String tableId;
    private Boolean active;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_type_id")
    private ReportType reportType;

}
