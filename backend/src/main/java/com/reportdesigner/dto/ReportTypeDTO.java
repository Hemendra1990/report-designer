package com.reportdesigner.dto;

import lombok.*;

import java.security.PrivateKey;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportTypeDTO {
    private String id;
    private String label;
    private String name;
    private String description;
    private String primaryTableId;
    private String primaryTable;
    private String primaryTableDisplayName;
    private String cteQuery;
    private String typeGroup;
    private List<String> usedTables;
    private List<ReportTypeConfigDTO> configList;
    private List<ReportTypeLayoutDTO> layoutList;
}