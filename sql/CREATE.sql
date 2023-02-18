CREATE OR REPLACE FUNCTION AUTO_SET_UPDATED_AT()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Accounts Table
CREATE TABLE IF NOT EXISTS accounts(
    id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255),
    gender VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    nickname VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    birth_date DATE,
    mbti_type VARCHAR(255),
    blood_type VARCHAR(255)
);

-- Create Primary Key
ALTER TABLE accounts ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);

-- Create Trigger
CREATE TRIGGER AUTO_SET_UPDATED_AT
    BEFORE UPDATE ON accounts
    FOR EACH ROW
EXECUTE PROCEDURE AUTO_SET_UPDATED_AT();

-- Create App Settings Table
CREATE TABLE IF NOT EXISTS app_settings(
    account_id UUID NOT NULL UNIQUE,
    visibility_mbti BOOLEAN NOT NULL DEFAULT TRUE,
    visibility_blood_type BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE app_settings ADD FOREIGN KEY (account_id) REFERENCES accounts (id);

-- Create Diary Content Table
CREATE TABLE IF NOT EXISTS diary_content(
    id UUID NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    diary_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    pinned BOOLEAN NOT NULL,
    secret_code VARCHAR(255),
    account_id UUID NOT NULL
);

-- ADD CONSTRAINT
ALTER TABLE diary_content ADD CONSTRAINT diary_content_pkey PRIMARY KEY (id);

ALTER TABLE diary_content ADD FOREIGN KEY (account_id) REFERENCES accounts (id);

--Create Trigger
CREATE TRIGGER AUTO_SET_UPDATED_AT
    BEFORE UPDATE ON diary_content
    FOR EACH ROW
EXECUTE PROCEDURE AUTO_SET_UPDATED_AT();

-- Create Diary Tag Table
CREATE TABLE IF NOT EXISTS diary_tag(
    id UUID NOT NULL UNIQUE,
    account_id UUID NOT NULL,
    diary_id UUID NOT NULL,
    tag VARCHAR(255) NOT NULL
);

-- ADD CONSTRAINT
ALTER TABLE diary_tag ADD CONSTRAINT diary_tag_pkey PRIMARY KEY (id);

ALTER TABLE diary_tag ADD FOREIGN KEY (account_id) REFERENCES accounts (id);

ALTER TABLE diary_tag ADD FOREIGN KEY (diary_id) REFERENCES diary_content (id);

-- ADD INDEXING
CREATE INDEX accounts_id_email_password ON accounts (id, email, password);

CREATE INDEX app_settings_account_id_index ON app_settings (account_id);

CREATE INDEX diary_content_id_diary_date_pinned_account_id_index ON diary_content (id, diary_date, pinned, account_id;)

CREATE INDEX diary_tag_id_account_id_diary_id_tag ON diary_tag (id, account_id, diary_id, tag);