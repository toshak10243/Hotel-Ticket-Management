const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.requestHistory.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating demo users...');
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma (Admin)',
      email: 'admin@aryaniwas.com',
      password: hashedPassword,
      role: 'Admin',
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Sunita Verma (Manager)',
      email: 'manager@aryaniwas.com',
      password: hashedPassword,
      role: 'Manager',
    },
  });

  const staffHousekeeping = await prisma.user.create({
    data: {
      name: 'Amit Kumar (Housekeeping)',
      email: 'amit@aryaniwas.com',
      password: hashedPassword,
      role: 'Staff',
    },
  });

  const staffMaintenance = await prisma.user.create({
    data: {
      name: 'Vikram Singh (Maintenance)',
      email: 'vikram@aryaniwas.com',
      password: hashedPassword,
      role: 'Staff',
    },
  });

  console.log('Seeding 10 sample requests...');
  const sampleRequests = [
    {
      ticketId: 'AN-2026-1011',
      roomNumber: '101',
      category: 'Housekeeping',
      requestType: 'ServiceRequest',
      description: 'Extra towels and fresh linen required for the double bedroom.',
      priority: 'Low',
      status: 'Resolved',
      assignedDepartment: 'Housekeeping',
      historyRemarks: 'Provided 2 clean bath towels and fresh bedsheets.',
      updatedBy: staffHousekeeping.id,
    },
    {
      ticketId: 'AN-2026-1022',
      roomNumber: '102',
      category: 'Maintenance',
      requestType: 'Complaint',
      description: 'Air conditioner is making loud rattling noise and not cooling properly.',
      priority: 'High',
      status: 'InProgress',
      assignedDepartment: 'Maintenance',
      historyRemarks: 'Technician dispatched to inspect compressor and fan motor.',
      updatedBy: staffMaintenance.id,
    },
    {
      ticketId: 'AN-2026-2013',
      roomNumber: '201',
      category: 'RoomService',
      requestType: 'ServiceRequest',
      description: 'Request for mineral water bottles and cutlery sets.',
      priority: 'Low',
      status: 'Closed',
      assignedDepartment: 'Room Service',
      historyRemarks: 'Delivered to room. Guest acknowledged receipt.',
      updatedBy: manager.id,
    },
    {
      ticketId: 'AN-2026-2044',
      roomNumber: '204',
      category: 'FrontOffice',
      requestType: 'ServiceRequest',
      description: 'Need wake up call tomorrow morning at 6:00 AM for airport departure.',
      priority: 'Medium',
      status: 'Assigned',
      assignedDepartment: 'Front Office',
      historyRemarks: 'Logged in operator wake-up call schedule system.',
      updatedBy: admin.id,
    },
    {
      ticketId: 'AN-2026-3055',
      roomNumber: '305',
      category: 'Maintenance',
      requestType: 'Complaint',
      description: 'Bathroom shower has zero hot water pressure.',
      priority: 'High',
      status: 'Pending',
      assignedDepartment: null,
      historyRemarks: null,
      updatedBy: null,
    },
    {
      ticketId: 'AN-2026-3086',
      roomNumber: '308',
      category: 'Housekeeping',
      requestType: 'ServiceRequest',
      description: 'Daily room cleaning and sanitization required before 2 PM.',
      priority: 'Medium',
      status: 'InProgress',
      assignedDepartment: 'Housekeeping',
      historyRemarks: 'Room attendant currently attending.',
      updatedBy: staffHousekeeping.id,
    },
    {
      ticketId: 'AN-2026-4017',
      roomNumber: '401',
      category: 'RoomService',
      requestType: 'Complaint',
      description: 'Food delivered 45 minutes late and soup was completely cold.',
      priority: 'High',
      status: 'Assigned',
      assignedDepartment: 'Room Service',
      historyRemarks: 'Escalated to kitchen supervisor for complimentary replacement.',
      updatedBy: manager.id,
    },
    {
      ticketId: 'AN-2026-4058',
      roomNumber: '405',
      category: 'Other',
      requestType: 'ServiceRequest',
      description: 'Inquiry regarding local Jaipur sightseeing cab arrangement.',
      priority: 'Low',
      status: 'Pending',
      assignedDepartment: null,
      historyRemarks: null,
      updatedBy: null,
    },
    {
      ticketId: 'AN-2026-5029',
      roomNumber: '502',
      category: 'Maintenance',
      requestType: 'Complaint',
      description: 'Television set not powering on and remote batteries seem dead.',
      priority: 'Medium',
      status: 'Resolved',
      assignedDepartment: 'Maintenance',
      historyRemarks: 'Replaced power cable socket and new remote batteries provided.',
      updatedBy: staffMaintenance.id,
    },
    {
      ticketId: 'AN-2026-5030',
      roomNumber: '503',
      category: 'Housekeeping',
      requestType: 'Complaint',
      description: 'Balcony floor was dusty on arrival.',
      priority: 'Low',
      status: 'Closed',
      assignedDepartment: 'Housekeeping',
      historyRemarks: 'Thoroughly swept, mopped and inspected by housekeeping lead.',
      updatedBy: manager.id,
    },
  ];

  for (const item of sampleRequests) {
    const createdReq = await prisma.serviceRequest.create({
      data: {
        ticketId: item.ticketId,
        roomNumber: item.roomNumber,
        category: item.category,
        requestType: item.requestType,
        description: item.description,
        priority: item.priority,
        status: item.status,
        assignedDepartment: item.assignedDepartment,
      },
    });

    // Create initial history record
    await prisma.requestHistory.create({
      data: {
        requestId: createdReq.id,
        previousStatus: 'Pending',
        newStatus: item.status,
        remarks: item.historyRemarks || 'Request registered by guest via room QR code.',
        updatedById: item.updatedBy,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

