package com.reportdesigner.dto;

import lombok.*;

import java.security.PrivateKey;
import java.time.OffsetDateTime;
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
    private String objectTree;
    private OffsetDateTime createdOn;
    private OffsetDateTime updatedOn;
    private List<String> usedTables;
    private List<ReportTypeConfigDTO> configList;
    private List<ReportTypeLayoutDTO> layoutList;
}