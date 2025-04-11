package com.reportdesigner.constant;

public enum ReportTypeGroup {
    TABULAR("Tabular"),
    SUMMARY("Summary"),
    MATRIX("Matrix"),
    JOINED("Joined");

    private String type;

    ReportTypeGroup(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}
