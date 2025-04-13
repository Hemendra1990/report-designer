package com.reportdesigner.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.reportdesigner.model.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReportDTO {
    private String id;
    private String name;
    private String label;
    private String description;
    private ReportTypeDTO reportType;
    private String sqlQuery;
    private String sqlQueryWithGrouping;
    private List<ReportColumnDTO> columns;
    private List<ReportGroupDTO> groups;
    private List<ReportFilterDTO> filters;

    private String filterRule;
    private String reportTypeName;
    private String primaryTable;
    private List<String> usedTables;
    
    //private List<ReportPivot> pivots;

    public ReportDTO(String id, String name, String label, String reportTypeName, String primaryTable, List<String> usedTables) {
        this.id = id;
        this.name = name;
        this.label = label;
        this.reportTypeName = reportTypeName;
        this.primaryTable = primaryTable;
        this.usedTables = usedTables;
    }
}