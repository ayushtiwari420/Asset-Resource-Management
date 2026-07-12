require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

const User = require('./models/User.model');
const Employee = require('./models/Employee.model');
const Department = require('./models/Department.model');
const AssetCategory = require('./models/AssetCategory.model');
const Asset = require('./models/Asset.model');
const AssetAllocation = require('./models/Allocation.model');
const ResourceBooking = require('./models/Booking.model');
const MaintenanceRequest = require('./models/MaintenanceRequest.model');
const MaintenanceHistory = require('./models/MaintenanceHistory.model');
const AuditCycle = require('./models/AuditCycle.model');
const AuditItem = require('./models/AuditItem.model');
const ActivityLog = require('./models/ActivityLog.model');
const Notification = require('./models/Notification.model');
const TransferRequest = require('./models/TransferRequest.model');
const Counter = require('./models/Counter.model');

const mongoUri = process.env.MONGODB_URI;
const seedPassword = 'AssetFlow@123';

const closeConnection = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

const clearDatabase = async () => {
  await Promise.all([
    User.deleteMany({}),
    Employee.deleteMany({}),
    Department.deleteMany({}),
    AssetCategory.deleteMany({}),
    Asset.deleteMany({}),
    AssetAllocation.deleteMany({}),
    ResourceBooking.deleteMany({}),
    MaintenanceRequest.deleteMany({}),
    MaintenanceHistory.deleteMany({}),
    AuditCycle.deleteMany({}),
    AuditItem.deleteMany({}),
    ActivityLog.deleteMany({}),
    Notification.deleteMany({}),
    TransferRequest.deleteMany({}),
    Counter.deleteMany({}),
  ]);
};

const createUsersAndOrganization = async () => {
  const password = await bcrypt.hash(seedPassword, 12);
  const userDocuments = [
    {
      name: 'AssetFlow Administrator',
      email: 'admin@assetflow.com',
      password,
      role: 'Admin',
      isActive: true,
    },
    ...Array.from({ length: 3 }, (_, index) => ({
      name: faker.person.fullName(),
      email: `manager${index + 1}@assetflow.com`,
      password,
      role: 'AssetManager',
      isActive: true,
    })),
    ...Array.from({ length: 34 }, (_, index) => ({
      name: faker.person.fullName(),
      email: `employee${index + 1}@assetflow.example`,
      password,
      role: 'Employee',
      isActive: true,
    })),
  ];

  const users = await User.insertMany(userDocuments);
  const admin = users[0];
  const managers = users.slice(1, 4);
  const employeeUsers = users.slice(4);
  const employees = await Employee.insertMany(
    employeeUsers.map((user, index) => ({
      user: user._id,
      employeeId: `EMP-${String(index + 1).padStart(4, '0')}`,
      designation: faker.person.jobTitle(),
      phone: faker.phone.number(),
      joiningDate: faker.date.past({ years: 5 }),
      status: 'active',
    }))
  );

  const departmentDefinitions = [
    { name: 'Engineering', code: 'ENG' },
    { name: 'Human Resources', code: 'HR' },
    { name: 'UI/UX Design', code: 'UX' },
    { name: 'Global Operations', code: 'OPS' },
  ];
  const departments = await Department.insertMany(
    departmentDefinitions.map((department) => ({ ...department, createdBy: admin._id }))
  );

  await Promise.all(
    departments.map((department, index) =>
      Promise.all([
        Department.findByIdAndUpdate(department._id, {
          head: employeeUsers[index]._id,
          departmentHead: employees[index]._id,
        }),
        Employee.findByIdAndUpdate(employees[index]._id, { department: department._id }),
        User.findByIdAndUpdate(employeeUsers[index]._id, {
          role: 'DepartmentHead',
          department: department._id,
        }),
      ])
    )
  );
  departments.forEach((department, index) => {
    employees[index].department = department._id;
  });

  await Promise.all(
    employees.slice(4).map((employee, index) => {
      const department = departments[index % departments.length];
      employee.department = department._id;
      return Employee.findByIdAndUpdate(employee._id, { department: department._id });
    })
  );

  return { admin, managers, employees, employeeUsers, departments };
};

const createCategoriesAndAssets = async (admin, departments) => {
  const categories = await AssetCategory.insertMany([
    {
      name: 'Electronics',
      prefix: 'ELEC',
      customFields: { warranty_months: 24, power_source: 'Electric' },
      createdBy: admin._id,
    },
    {
      name: 'Furniture',
      prefix: 'FURN',
      customFields: { material: 'Mixed commercial grade' },
      createdBy: admin._id,
    },
    {
      name: 'Vehicles',
      prefix: 'VEH',
      customFields: { requires_insurance: true },
      createdBy: admin._id,
    },
  ]);

  const electronics = categories.find((category) => category.name === 'Electronics');
  const furniture = categories.find((category) => category.name === 'Furniture');
  const vehicles = categories.find((category) => category.name === 'Vehicles');
  const statuses = [
    ...Array(35).fill('Available'),
    ...Array(10).fill('Allocated'),
    ...Array(3).fill('Under Maintenance'),
    ...Array(2).fill('Lost'),
  ];
  const assets = [];

  for (let index = 0; index < 50; index += 1) {
    const assetTag = `AF-${String(index + 1).padStart(4, '0')}`;
    const isBookable = index < 5;
    const category = index < 3
      ? furniture
      : index < 5
        ? electronics
        : faker.helpers.arrayElement([electronics, furniture, vehicles]);
    const name = index < 3
      ? `Conference Room ${String.fromCharCode(65 + index)}`
      : index < 5
        ? `Projector ${index - 2}`
        : `${faker.commerce.productAdjective()} ${faker.commerce.product()} ${index + 1}`;
    const asset = await Asset.create({
      assetTag,
      serialNumber: `SN-${String(index + 1).padStart(6, '0')}`,
      name,
      description: faker.commerce.productDescription(),
      category: category._id,
      acquisitionDate: faker.date.past({ years: 6 }),
      acquisitionCost: faker.number.int({ min: 300, max: 180000 }),
      condition: faker.helpers.arrayElement(['New', 'Good', 'Fair']),
      location: faker.helpers.arrayElement(departments).name,
      isBookable,
      status: statuses[index],
      createdBy: admin._id,
    });
    assets.push(asset);
  }

  return { categories, assets };
};

const createOperations = async ({ admin, managers, employees, employeeUsers, assets }) => {
  const allocatedAssets = assets.filter((asset) => asset.status === 'Allocated');
  const allocations = allocatedAssets.map((asset, index) => ({
    asset: asset._id,
    allocatedToType: 'Employee',
    employee: employees[index]._id,
    allocatedBy: admin._id,
    returnDueDate: index < 3
      ? faker.date.recent({ days: 7, refDate: new Date(Date.now() - 24 * 60 * 60 * 1000) })
      : faker.date.soon({ days: 45 }),
    returnedAt: null,
    status: 'Active',
    isActive: true,
    notes: faker.lorem.sentence(),
  }));
  await AssetAllocation.insertMany(allocations);
  await Promise.all(
    allocatedAssets.map((asset, index) =>
      Asset.findByIdAndUpdate(asset._id, { assignedTo: employees[index]._id })
    )
  );

  const bookableAssets = assets.filter((asset) => asset.isBookable);
  const todayStart = new Date();
  todayStart.setHours(9, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(10, 0, 0, 0);
  const bookings = [
    {
      asset: bookableAssets[0]._id,
      bookedBy: employeeUsers[0]._id,
      department: employees[0].department,
      startTime: todayStart,
      endTime: todayEnd,
      purpose: 'Daily engineering stand-up',
      status: 'Upcoming',
    },
    ...Array.from({ length: 5 }, (_, index) => {
      const startTime = faker.date.soon({ days: index + 2 });
      startTime.setHours(10 + index, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
      return {
        asset: bookableAssets[index % bookableAssets.length]._id,
        bookedBy: employeeUsers[index + 1]._id,
        department: employees[index + 1].department,
        startTime,
        endTime,
        purpose: faker.company.catchPhrase(),
        status: 'Upcoming',
      };
    }),
  ];
  await ResourceBooking.insertMany(bookings);

  const maintenanceAssets = assets.filter((asset) => asset.status === 'Under Maintenance');
  await MaintenanceRequest.insertMany([
    ...maintenanceAssets.map((asset, index) => ({
      asset: asset._id,
      reportedBy: employeeUsers[index]._id,
      assignedTo: managers[index % managers.length]._id,
      description: faker.lorem.sentences(2),
      priority: faker.helpers.arrayElement(['Medium', 'High', 'Critical']),
      status: index === 0 ? 'Pending' : 'In_Progress',
      startedAt: index === 0 ? null : faker.date.recent({ days: 3 }),
    })),
    ...assets.slice(0, 2).map((asset, index) => ({
      asset: asset._id,
      reportedBy: employeeUsers[index + 5]._id,
      assignedTo: managers[index]._id,
      description: faker.lorem.sentences(2),
      priority: 'Low',
      status: 'Resolved',
      completedAt: faker.date.recent({ days: 30 }),
      resolutionNotes: faker.lorem.sentence(),
      actualCost: faker.number.int({ min: 100, max: 1500 }),
    })),
  ]);

  const resolvedRequests = await MaintenanceRequest.find({ status: 'Resolved' });
  await MaintenanceHistory.insertMany(
    resolvedRequests.map((request) => ({
      asset: request.asset,
      maintenanceRequest: request._id,
      performedBy: 'AssetFlow Facilities Team',
      performedByUser: request.assignedTo,
      workDone: request.resolutionNotes,
      cost: request.actualCost || 0,
      datePerformed: request.completedAt,
      condition: 'Good',
    }))
  );

  const cycle = await AuditCycle.create({
    name: `Enterprise Audit ${new Date().getFullYear()}`,
    scopeType: 'Location',
    scopeValue: 'All Locations',
    status: 'Closed',
    createdBy: admin._id,
    totalAssets: assets.length,
    verifiedAssets: assets.length,
    discrepancies: 2,
  });
  const lostAssetIds = new Set(assets.filter((asset) => asset.status === 'Lost').map((asset) => String(asset._id)));
  await AuditItem.insertMany(
    assets.map((asset) => ({
      auditCycle: cycle._id,
      asset: asset._id,
      assignedTo: admin._id,
      status: lostAssetIds.has(String(asset._id)) ? 'Missing' : 'Verified',
      expectedLocation: asset.location,
      actualLocation: lostAssetIds.has(String(asset._id)) ? null : asset.location,
      verifiedAt: faker.date.recent({ days: 14 }),
      verifiedBy: admin._id,
    }))
  );
};

const seed = async () => {
  try {
    if (!mongoUri) throw new Error('MONGODB_URI is required in the server environment.');

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    console.log('Clearing existing collections...');
    await clearDatabase();

    console.log('Phase A: creating users, employees, and departments...');
    const organization = await createUsersAndOrganization();

    console.log('Phase B: creating categories and inventory...');
    const inventory = await createCategoriesAndAssets(organization.admin, organization.departments);

    console.log('Phase C: creating allocations, bookings, maintenance, and audit data...');
    await createOperations({ ...organization, ...inventory });

    console.log('Seed completed successfully.');
    console.log(`Login: admin@assetflow.com / ${seedPassword}`);
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    await closeConnection();
    process.exit(1);
  }
};

seed();
