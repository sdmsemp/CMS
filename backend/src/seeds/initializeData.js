const db = require('../models');
const bcrypt = require('bcryptjs');
const { registerSchema } = require('../validation/authValidation');
const { createDepartmentSchema } = require('../validation/departmentValidation');
const { createRoleSchema } = require('../validation/roleValidation');

// Create roles
const createRoles = async () => {
  try {
    const roles = [
      { role_id: 1, role: 'superadmin', description: 'Super Administrator with full access' },
      { role_id: 2, role: 'subadmin', description: 'Sub Administrator with department-level access' },
      { role_id: 3, role: 'employee', description: 'Regular employee' }
    ];

    for (const role of roles) {
      try {
        console.log(`Attempting to create/find role: ${role.role}`);
        
        // Validate role data
        const { error } = createRoleSchema.validate({
          role_id: role.role_id,
          role: role.role
        });

        if (error) {
          console.error(`Validation error for role ${role.role}:`, error.details[0].message);
          continue;
        }

        const [roleInstance, created] = await db.Role.findOrCreate({
          where: { role_id: role.role_id },
          defaults: {
            role_id: role.role_id,
            role: role.role
          }
        });

        if (created) {
          console.log(`Created new role: ${role.role}`);
        } else {
          console.log(`Role already exists: ${role.role}`);
          // Update the role name if it's different
          if (roleInstance.role !== role.role) {
            await roleInstance.update({ role: role.role });
            console.log(`Updated role name from ${roleInstance.role} to ${role.role}`);
          }
        }
      } catch (roleError) {
        console.error(`Error processing role ${role.role}:`, roleError);
        throw roleError;
      }
    }
    
    // Verify all roles exist
    const existingRoles = await db.Role.findAll();
    console.log('Current roles in database:', existingRoles.map(r => ({ id: r.role_id, role: r.role })));
    
    console.log('Roles created successfully');
  } catch (error) {
    console.error('Error creating roles:', error);
    throw error;
  }
};

// Create departments
const createDepartments = async () => {
  try {
    const departments = [
      { name: 'IT', description: 'Information Technology Department' },
      { name: 'HR', description: 'Human Resources Department' },
      { name: 'Finance', description: 'Finance Department' }
    ];

    for (const dept of departments) {
      // Validate department data
      const { error } = createDepartmentSchema.validate({
        name: dept.name
      });

      if (error) {
        console.error(`Validation error for department ${dept.name}:`, error.details[0].message);
        continue;
      }

      await db.Department.findOrCreate({
        where: { name: dept.name },
        defaults: dept
      });
    }
    console.log('Departments created successfully');
  } catch (error) {
    console.error('Error creating departments:', error);
    throw error;
  }
};

// Create super admin if not exists
const seedAdmin = async () => {
  try {
    const [itDepartment] = await db.Department.findOrCreate({
      where: { name: 'IT' }
    });

    const adminExists = await db.User.findOne({
      where: { emp_id: 100 }
    });

    if (!adminExists) {
      const adminData = {
        emp_id: 100,  // Added emp_id
        name: 'Super Admin',
        email: 'admin@starkdigital.in',
        password: 'Admin@123456', // Contains special char @ and two digits 12
        dept_id: 1
      };

      // Validate admin data
      const { error } = registerSchema.validate(adminData);

      if (error) {
        console.error('Validation error for admin:', error.details[0].message);
        throw new Error(`Admin validation failed: ${error.details[0].message}`);
      }

      await db.User.create({
        emp_id: adminData.emp_id,
        name: adminData.name,
        email: adminData.email,
        password_hash: adminData.password,
        dept_id: adminData.dept_id,
        role_id: 1, // superadmin role
        refresh_token: null
      });
      console.log('Super admin created successfully');
    } else {
      console.log('Super admin already exists');
    }
  } catch (error) {
    console.error('Error creating super admin:', error);
    throw error;
  }
};

// Main initialization function
const initializeData = async () => {
  try {
    await createRoles();
    await createDepartments();
    await seedAdmin();
    console.log('Data initialization completed successfully');
  } catch (error) {
    console.error('Data initialization failed:', error);
    throw error;
  }
};

module.exports = {
  initializeData,
  createRoles,
  createDepartments,
  seedAdmin
}; 