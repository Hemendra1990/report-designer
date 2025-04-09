package com.reportdesigner.model;

import com.reportdesigner.util.StringListConverter;
import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "rd_report_type")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReportType extends BaseEntity {

    @Id
    @Tsid
    @Column(length = 50)
    private String id;

    private String label;
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
    private String primaryTableId;
    private String primaryTable;
    private String primaryTableDisplayName;
    private String typeGroup;

    @Column(columnDefinition = "TEXT")
    private String cteQuery;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> usedTables;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReportTypeConfig> configList;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReportTypeLayout> layoutList;
}
