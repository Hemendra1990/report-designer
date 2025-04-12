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
public class ReportFilterDTO {
    private String id;
    private ReportDTO report;
    private String tableName;
    private String columnName;
    private String duckDBColumnName;
    private String operator;
    private String value;
    private Integer sortOrder;
    private String logicalOperator;
    private String customFormula;
}