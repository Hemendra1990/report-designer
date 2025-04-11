package com.reportdesigner.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReportTypeConfigDTO {
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
    private ReportTypeDTO reportType;
}