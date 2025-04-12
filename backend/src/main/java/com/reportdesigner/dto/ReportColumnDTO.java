package com.reportdesigner.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReportColumnDTO {
    private String id;
    private ReportDTO report;
    private String tableName;
    private String columnName;
    private String displayName;
    private String duckDBColumnName;
    private Integer sortOrder;
    private Boolean visible;
    private String aggregationType;
}