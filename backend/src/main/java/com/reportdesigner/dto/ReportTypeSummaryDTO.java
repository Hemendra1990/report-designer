package com.reportdesigner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportTypeSummaryDTO {
    private String id;
    private String name;
    private String description;
    private String createdBy;
    private OffsetDateTime createdOn;
    private List<String> usedTables;
    private int columnCount;
}
