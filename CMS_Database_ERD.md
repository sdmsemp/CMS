# CMS Database Entity Relationship Diagram

## Overview
This diagram represents the complete database structure for the Complaint Management System (CMS) with all tables, fields, and relationships.

## Database Schema

```mermaid
erDiagram
    %% Core User Management Tables
    ROLES {
        tinyint role_id PK "1=superadmin, 2=subadmin, 3=employee"
        string role "superadmin, subadmin, employee"
    }

    DEPARTMENTS {
        int dept_id PK "Auto Increment"
        string name "Unique Department Name"
    }

    USERS {
        int emp_id PK "3-digit Employee ID (100-999)"
        string name "2-20 characters"
        string email "Unique, @starkdigital.in domain"
        string password_hash "Bcrypt hashed"
        int dept_id FK "References departments.dept_id"
        tinyint role_id FK "References roles.role_id"
        text refresh_token "JWT refresh token"
        datetime created_at
        datetime updated_at
    }

    %% Complaint Management Tables
    COMPLAINTS {
        int complaint_id PK "Auto Increment"
        int emp_id FK "References users.emp_id (Complaint Creator)"
        int dept_id FK "References departments.dept_id"
        string title "3-25 characters"
        string description "10-100 characters"
        string response "10-200 characters, Optional"
        enum severity "low, medium, high"
        enum status "Pending, InProgress, Complete, Rejected"
        datetime created_at
    }

    SUBADMIN_TASKS {
        int task_id PK "Auto Increment"
        int emp_id FK "References users.emp_id (Subadmin)"
        int complaint_id FK "References complaints.complaint_id"
        string description "10-100 characters"
        datetime created_at
    }

    ATTACHMENTS {
        int attachment_id PK "Auto Increment"
        int complaint_id FK "References complaints.complaint_id"
        string file_name "255 characters"
        string file_path "512 characters"
        string file_type "100 characters"
        int file_size "Size in bytes"
        int uploaded_by FK "References users.emp_id"
        datetime created_at
        datetime updated_at
    }

    %% Activity and Notification Tables
    ACTIVITY_LOGS {
        bigint log_id PK "Auto Increment"
        int emp_id FK "References users.emp_id"
        string action "100 characters"
        string module "50 characters, Optional"
        datetime timestamp
        datetime created_at
    }

    NOTIFICATIONS {
        int notification_id PK "Auto Increment"
        int emp_id FK "References users.emp_id"
        string title "100 characters"
        text message
        enum type "complaint, task, system"
        int reference_id "Related entity ID, Optional"
        boolean is_read "Default: false"
        datetime created_at
    }

    %% Relationships
    ROLES ||--o{ USERS : "has"
    DEPARTMENTS ||--o{ USERS : "has"
    USERS ||--o{ COMPLAINTS : "creates"
    DEPARTMENTS ||--o{ COMPLAINTS : "belongs_to"
    USERS ||--o{ SUBADMIN_TASKS : "assigned_to"
    COMPLAINTS ||--o{ SUBADMIN_TASKS : "has"
    COMPLAINTS ||--o{ ATTACHMENTS : "has"
    USERS ||--o{ ATTACHMENTS : "uploads"
    USERS ||--o{ ACTIVITY_LOGS : "performs"
    USERS ||--o{ NOTIFICATIONS : "receives"
```

## Relationship Details

### 1. **User Management**
- **ROLES** → **USERS** (1:Many): Each role can have multiple users
- **DEPARTMENTS** → **USERS** (1:Many): Each department can have multiple users

### 2. **Complaint System**
- **USERS** → **COMPLAINTS** (1:Many): Users can create multiple complaints
- **DEPARTMENTS** → **COMPLAINTS** (1:Many): Complaints belong to departments
- **COMPLAINTS** → **ATTACHMENTS** (1:Many): Complaints can have multiple attachments
- **USERS** → **ATTACHMENTS** (1:Many): Users can upload multiple attachments

### 3. **Task Management**
- **USERS** → **SUBADMIN_TASKS** (1:Many): Subadmins can have multiple tasks
- **COMPLAINTS** → **SUBADMIN_TASKS** (1:Many): Complaints can have multiple tasks

### 4. **Activity Tracking**
- **USERS** → **ACTIVITY_LOGS** (1:Many): Users can have multiple activity logs

### 5. **Notifications**
- **USERS** → **NOTIFICATIONS** (1:Many): Users can receive multiple notifications

## Key Features

### 🔐 **Authentication & Authorization**
- Role-based access control (Superadmin, Subadmin, Employee)
- JWT token management with refresh tokens
- Password hashing with bcrypt

### 📋 **Complaint Management**
- Multi-department complaint system
- Severity levels (low, medium, high)
- Status tracking (Pending, InProgress, Complete, Rejected)
- File attachment support

### 👥 **User Management**
- Department-based user organization
- 3-digit employee ID system
- Email domain validation (@starkdigital.in)

### 📊 **Activity Monitoring**
- Comprehensive activity logging
- Module-based activity categorization
- Timestamp tracking

### 🔔 **Notification System**
- Multi-type notifications (complaint, task, system)
- Read/unread status tracking
- Reference ID linking to related entities

## Indexes for Performance

### **USERS Table**
- `emp_id` (Primary Key)
- `email` (Unique)
- `dept_id` (Foreign Key)
- `role_id` (Foreign Key)

### **COMPLAINTS Table**
- `complaint_id` (Primary Key)
- `emp_id` (Foreign Key)
- `dept_id` (Foreign Key)
- `status` (For filtering)

### **SUBADMIN_TASKS Table**
- `task_id` (Primary Key)
- `emp_id` (Foreign Key)
- `complaint_id` (Foreign Key)
- `created_at` (For sorting)

### **ACTIVITY_LOGS Table**
- `log_id` (Primary Key)
- `emp_id` (Foreign Key)
- `timestamp` (For date filtering)
- `module` (For module filtering)

### **NOTIFICATIONS Table**
- `notification_id` (Primary Key)
- `emp_id` (Foreign Key)
- `created_at` (For sorting)

### **ATTACHMENTS Table**
- `attachment_id` (Primary Key)
- `complaint_id` (Foreign Key)
- `uploaded_by` (Foreign Key)

## Data Flow

```mermaid
graph TD
    A[User Login] --> B[Authentication]
    B --> C[Role Check]
    C --> D[Access Control]
    
    D --> E[Create Complaint]
    D --> F[View Complaints]
    D --> G[Manage Tasks]
    
    E --> H[Department Assignment]
    H --> I[Notification to Subadmin]
    I --> J[Task Creation]
    
    F --> K[Status Updates]
    K --> L[Activity Logging]
    L --> M[Notifications]
    
    G --> N[Task Completion]
    N --> O[Complaint Status Update]
    O --> P[Final Notification]
```

## Security Features

1. **Password Security**: Bcrypt hashing with salt
2. **Email Validation**: Domain-specific email addresses
3. **Role-based Access**: Three-tier permission system
4. **Input Validation**: Length and format constraints
5. **Foreign Key Constraints**: Referential integrity
6. **Audit Trail**: Complete activity logging

This database design supports a comprehensive complaint management system with proper user management, task assignment, file handling, and activity tracking capabilities. 