package com.reportdesigner.dto;

import java.util.Map;

public class FileReadRequest {
        private String filePath;
        private Map<String, Object> options;

        public String getFilePath() {
            return filePath;
        }

        public void setFilePath(String filePath) {
            this.filePath = filePath;
        }

        public Map<String, Object> getOptions() {
            return options;
        }

        public void setOptions(Map<String, Object> options) {
            this.options = options;
        }
    }