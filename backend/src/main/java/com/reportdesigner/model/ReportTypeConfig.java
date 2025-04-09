package com.reportdesigner.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "rd_report_type_config")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReportTypeConfig extends BaseEntity {

    @Id
    @Tsid
    @Column(length = 50)
    private String id;

    private String joinType;
    private String primaryTableId;
    private String primaryTableName;
    private String primaryTableDisplayName;
    private String fromColumn;
    private String joinTableId;
    private String joinTableName;
    private String joinTableDisplayName;
    private String referColumn;
    private Integer sortOrder;

    @ManyToOne
    @JoinColumn(name = "report_type_id")
    @JsonBackReference
    private ReportType reportType;

}
