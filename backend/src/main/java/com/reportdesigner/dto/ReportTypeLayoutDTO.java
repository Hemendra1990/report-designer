package com.reportdesigner.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportTypeLayoutDTO {
    private String id;
    private String columnName;
    private String columnDisplayName;
    private String columnType;
    private String tableName;
    private String tableId;
    private Boolean active;
}
