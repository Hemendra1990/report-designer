package com.reportdesigner.util;

import com.reportdesigner.dto.ReportColumnDTO;
import com.reportdesigner.dto.ReportDTO;
import com.reportdesigner.dto.ReportGroupDTO;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class ReportQueryBuilder {

    public static String buildQuery(ReportDTO report, String cteName, boolean withGrouping) {
        String selectClause = buildSelectClause(report.getColumns());
        String fromClause = String.format(" FROM %s ", cteName);
        String whereClause = buildWhereClause(report.getFilterRule());

        return selectClause + "\n" + fromClause + "\n" + whereClause;
    }

    private static String buildSelectClause(List<ReportColumnDTO> columns) {
        String columnsPart = columns.stream()
                .map(col -> String.format(" %s AS %s ", col.getDuckDBColumnName(), col.getDisplayName()))
                .collect(Collectors.joining(", "));

        return String.format("SELECT %s ", columnsPart);
    }

    private static String buildWhereClause(String filterRule) {
        return "";
    }

    private String buildGroupByClause(List<ReportGroupDTO> groups) {
        if (groups == null || groups.isEmpty()) {
            return "";
        }

        String groupByPart = groups.stream()
                .sorted(Comparator.comparingInt(g -> g.getSortOrder() != null ? g.getSortOrder() : 0))
                .map(group -> group.getTableName() + "." + group.getColumnName())
                .collect(Collectors.joining(", "));

        return "GROUP BY " + groupByPart;
    }
}
