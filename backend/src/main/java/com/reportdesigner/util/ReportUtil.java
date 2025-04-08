package com.reportdesigner.util;

import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

@Component
public class ReportUtil {

    public String generateNameFromLabel(String label) {
        if (StringUtils.isBlank(label)) {
            return "";
        }
        return label.trim().replace(" ", "_");
    }
}
