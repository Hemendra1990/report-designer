CREATE TABLE IF NOT EXISTS dashboards (
	id varchar(50) NOT NULL,
	created_by varchar(255) NULL,
	created_on timestamptz(6) NULL,
	is_active bool NULL,
	is_deleted bool NULL,
	updated_by varchar(255) NULL,
	updated_on timestamptz(6) NULL,
	active bool NULL,
	auto_refresh bool NOT NULL,
	description varchar(500) NULL,
	is_public bool NOT NULL,
	layout varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	publish_url varchar(255) NOT NULL,
	published bool NOT NULL,
	refresh_interval varchar(255) NOT NULL,
	theme varchar(255) NOT NULL,
	CONSTRAINT dashboards_pkey PRIMARY KEY (id),
	CONSTRAINT uk_6pqg6i4ic6dgiu5i1dk49mhph UNIQUE (publish_url)
);

CREATE TABLE IF NOT EXISTS rd_report (
	id varchar(50) NOT NULL,
	created_by varchar(255) NULL,
	created_on timestamptz(6) NULL,
	is_active bool NULL,
	is_deleted bool NULL,
	updated_by varchar(255) NULL,
	updated_on timestamptz(6) NULL,
	description text NULL,
	filter_rule text NULL,
	"label" varchar(255) NULL,
	"name" varchar(255) NULL,
	sql_query text NULL,
	sql_query_with_grouping text NULL,
	report_type_id varchar(50) NULL,
	CONSTRAINT rd_report_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS rd_report_column (
	id varchar(50) NOT NULL,
	created_by varchar(255) NULL,
	created_on timestamptz(6) NULL,
	is_active bool NULL,
	is_deleted bool NULL,
	updated_by varchar(255) NULL,
	updated_on timestamptz(6) NULL,
	alias varchar(255) NULL,
	category varchar(255) NULL,
	column_display_name varchar(255) NULL,
	column_name varchar(255) NULL,
	column_type varchar(255) NULL,
	description text NULL,
	duckdbcolumn_display_name varchar(255) NULL,
	duckdbcolumn_name varchar(255) NULL,
	formula text NULL,
	icon varchar(255) NULL,
	is_formula bool NULL,
	is_summary_formula bool NULL,
	"name" varchar(255) NULL,
	table_id varchar(255) NULL,
	table_name varchar(255) NULL,
	"type" varchar(255) NULL,
	report_id varchar(50) NULL,
	CONSTRAINT rd_report_column_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS rd_report_filter (
	id varchar(50) NOT NULL,
	created_by varchar(255) NULL,
	created_on timestamptz(6) NULL,
	is_active bool NULL,
	is_deleted bool NULL,
	updated_by varchar(255) NULL,
	updated_on timestamptz(6) NULL,
	column_name varchar(255) NULL,
	custom_formula text NULL,
	duckdbcolumn_name varchar(255) NULL,
	logical_operator varchar(255) NULL,
	"operator" varchar(255) NULL,
	sort_order int4 NULL,
	table_name varchar(255) NULL,
	value text NULL,
	report_id varchar(50) NULL,
	CONSTRAINT rd_report_filter_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS rd_report_group (
	id varchar(50) NOT NULL,
	created_by varchar(255) NULL,
	created_on timestamptz(6) NULL,
	is_active bool NULL,
	is_deleted bool NULL,
	updated_by varchar(255) NULL,
	updated_on timestamptz(6) NULL,
	column_name varchar(255) NULL,
	display_name varchar(255) NULL,
	duckdbcolumn_name varchar(255) NULL,
	sort_direction varchar(255) NULL,
	sort_order int4 NULL,
	summary_formula text NULL,
	table_name varchar(255) NULL,
	report_id varchar(50) NULL,
	CONSTRAINT rd_report_group_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS rd_report_type (
	id varchar(50) NOT NULL,
	created_by varchar(255) NULL,
	created_on timestamptz(6) NULL,
	is_active bool NULL,
	is_deleted bool NULL,
	updated_by varchar(255) NULL,
	updated_on timestamptz(6) NULL,
	cte_query text NULL,
	description text NULL,
	"label" varchar(255) NULL,
	"name" varchar(255) NULL,
	object_tree text NULL,
	primary_table varchar(255) NULL,
	primary_table_display_name varchar(255) NULL,
	primary_table_id varchar(255) NULL,
	type_group varchar(255) NULL,
	used_tables text NULL,
	CONSTRAINT rd_report_type_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS rd_report_type_config (
	id varchar(50) NOT NULL,
	created_by varchar(255) NULL,
	created_on timestamptz(6) NULL,
	is_active bool NULL,
	is_deleted bool NULL,
	updated_by varchar(255) NULL,
	updated_on timestamptz(6) NULL,
	from_column varchar(255) NULL,
	join_table_display_name varchar(255) NULL,
	join_table_id varchar(255) NULL,
	join_table_name varchar(255) NULL,
	join_type varchar(255) NULL,
	primary_table_display_name varchar(255) NULL,
	primary_table_id varchar(255) NULL,
	primary_table_name varchar(255) NULL,
	refer_column varchar(255) NULL,
	sort_order int4 NULL,
	report_type_id varchar(50) NULL,
	CONSTRAINT rd_report_type_config_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS rd_report_type_layout (
	id varchar(50) NOT NULL,
	active bool NULL,
	column_display_name varchar(255) NULL,
	column_name varchar(255) NULL,
	column_type varchar(255) NULL,
	duckdbcolumn_display_name varchar(255) NULL,
	duckdbcolumn_name varchar(255) NULL,
	table_id varchar(255) NULL,
	table_name varchar(255) NULL,
	report_type_id varchar(50) NULL,
	CONSTRAINT rd_report_type_layout_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS widgets (
	id varchar(50) NOT NULL,
	created_by varchar(255) NULL,
	created_on timestamptz(6) NULL,
	is_active bool NULL,
	is_deleted bool NULL,
	updated_by varchar(255) NULL,
	updated_on timestamptz(6) NULL,
	active bool NULL,
	auto_refresh bool NOT NULL,
	"configuration" varchar(255) NOT NULL,
	description varchar(500) NULL,
	filters varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"position" varchar(255) NOT NULL,
	refresh_interval varchar(255) NOT NULL,
	"size" varchar(255) NOT NULL,
	"style" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	dashboard_id varchar(50) NOT NULL,
	CONSTRAINT widgets_pkey PRIMARY KEY (id)
);

DO $$
DECLARE
    schema_name TEXT := current_schema();
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fkalu4uup21sqi69r91s0hei6sg' AND constraint_schema = schema_name
    ) THEN
        ALTER TABLE rd_report
        ADD CONSTRAINT fkalu4uup21sqi69r91s0hei6sg FOREIGN KEY (report_type_id) REFERENCES rd_report_type(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fkgnujacgsfhe1c4p9pndymhfhf' AND constraint_schema = schema_name
    ) THEN
        ALTER TABLE rd_report_column
        ADD CONSTRAINT fkgnujacgsfhe1c4p9pndymhfhf FOREIGN KEY (report_id) REFERENCES rd_report(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fknn5m31xl9yk7u5ydjwnqh4rq7' AND constraint_schema = schema_name
    ) THEN
        ALTER TABLE rd_report_filter
        ADD CONSTRAINT fknn5m31xl9yk7u5ydjwnqh4rq7 FOREIGN KEY (report_id) REFERENCES rd_report(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk9pn030j9mrnwkkihdprwihwue' AND constraint_schema = schema_name
    ) THEN
        ALTER TABLE rd_report_group
        ADD CONSTRAINT fk9pn030j9mrnwkkihdprwihwue FOREIGN KEY (report_id) REFERENCES rd_report(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fkiks6vheaqvdfsmdl2vjf2i654' AND constraint_schema = schema_name
    ) THEN
        ALTER TABLE rd_report_type_config
        ADD CONSTRAINT fkiks6vheaqvdfsmdl2vjf2i654 FOREIGN KEY (report_type_id) REFERENCES rd_report_type(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fkmop3tlqhrhmxk7pj0ki5shqfw' AND constraint_schema = schema_name
    ) THEN
        ALTER TABLE rd_report_type_layout
        ADD CONSTRAINT fkmop3tlqhrhmxk7pj0ki5shqfw FOREIGN KEY (report_type_id) REFERENCES rd_report_type(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fkrmv42172j0f5io72clhaba2ad' AND constraint_schema = schema_name
    ) THEN
        ALTER TABLE widgets
        ADD CONSTRAINT fkrmv42172j0f5io72clhaba2ad FOREIGN KEY (dashboard_id) REFERENCES dashboards(id);
    END IF;

END $$;