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
    private String name;
    private String type;
    private String category;
    private String icon;
    private Boolean isFormula;
    private String formula;
    private Boolean isSummaryFormula;
    private String alias;
    private String description;
    private String tableName;
    private String tableId;
    private String columnName;
    private String columnDisplayName;
    private String columnType;
    private String duckDBColumnName;
    private String duckDBColumnDisplayName;
}