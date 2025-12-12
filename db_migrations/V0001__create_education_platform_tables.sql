-- Users table (employees, students, admins)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    position VARCHAR(200) NOT NULL,
    department VARCHAR(200),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'methodist', 'inspector', 'student')),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instructions table
CREATE TABLE instructions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('iot', 'job', 'equipment')),
    industry VARCHAR(200),
    profession VARCHAR(200),
    content TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived'))
);

-- Training programs
CREATE TABLE training_programs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    duration_hours INT NOT NULL,
    passing_score INT DEFAULT 80,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived'))
);

-- Program instructions (many-to-many)
CREATE TABLE program_instructions (
    program_id INT REFERENCES training_programs(id),
    instruction_id INT REFERENCES instructions(id),
    order_num INT,
    PRIMARY KEY (program_id, instruction_id)
);

-- Test questions
CREATE TABLE test_questions (
    id SERIAL PRIMARY KEY,
    instruction_id INT REFERENCES instructions(id),
    question TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_answer INT NOT NULL CHECK (correct_answer BETWEEN 0 AND 3),
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User assignments
CREATE TABLE user_assignments (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    program_id INT REFERENCES training_programs(id),
    assigned_by INT REFERENCES users(id),
    deadline DATE,
    status VARCHAR(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue')),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Test sessions
CREATE TABLE test_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    instruction_id INT REFERENCES instructions(id),
    test_mode VARCHAR(50) NOT NULL CHECK (test_mode IN ('practice', 'exam')),
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    score INT,
    correct_answers INT,
    total_questions INT,
    time_spent_seconds INT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Test answers (detailed results)
CREATE TABLE test_answers (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES test_sessions(id),
    question_id INT REFERENCES test_questions(id),
    user_answer INT CHECK (user_answer BETWEEN 0 AND 3),
    is_correct BOOLEAN,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates
CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    session_id INT REFERENCES test_sessions(id),
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    instruction_title VARCHAR(500) NOT NULL,
    score INT NOT NULL,
    issued_by INT REFERENCES users(id),
    qr_code_url VARCHAR(500),
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until DATE
);

-- Activity log
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    subject VARCHAR(500),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_instructions_category ON instructions(category);
CREATE INDEX idx_instructions_status ON instructions(status);
CREATE INDEX idx_test_sessions_user_id ON test_sessions(user_id);
CREATE INDEX idx_test_sessions_status ON test_sessions(status);
CREATE INDEX idx_user_assignments_user_id ON user_assignments(user_id);
CREATE INDEX idx_user_assignments_status ON user_assignments(status);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
