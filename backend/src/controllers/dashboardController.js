const prisma = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const totalRequests = await prisma.serviceRequest.count();
    const pendingRequests = await prisma.serviceRequest.count({
      where: { status: 'Pending' },
    });
    const inProgressRequests = await prisma.serviceRequest.count({
      where: { status: 'InProgress' },
    });
    const resolvedRequests = await prisma.serviceRequest.count({
      where: { status: 'Resolved' },
    });
    const closedRequests = await prisma.serviceRequest.count({
      where: { status: 'Closed' },
    });
    const highPriorityRequests = await prisma.serviceRequest.count({
      where: {
        priority: 'High',
        status: { in: ['Pending', 'Assigned', 'InProgress'] },
      },
    });

    const recentRequests = await prisma.serviceRequest.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    // Enterprise Analytics 1: Room-wise Complaint Analysis (Repeat issues detection)
    const roomGroups = await prisma.serviceRequest.groupBy({
      by: ['roomNumber'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    const roomAnalytics = roomGroups.map((g) => ({
      roomNumber: g.roomNumber,
      totalIssues: g._count.id,
      isHighAttention: g._count.id >= 3,
    }));

    // Enterprise Analytics 2: Department breakdown
    const departmentGroups = await prisma.serviceRequest.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    const departmentStats = departmentGroups.map((d) => ({
      category: d.category,
      count: d._count.id,
    }));

    // Enterprise Analytics 3: Staff Active Workload Overview
    const staffMembers = await prisma.user.findMany({
      where: { role: 'Staff' },
      select: { id: true, name: true, phone: true },
    });

    const staffWorkload = await Promise.all(
      staffMembers.map(async (s) => {
        const active = await prisma.serviceRequest.count({
          where: {
            assignedToStaff: s.name,
            status: { in: ['Assigned', 'InProgress'] },
          },
        });
        const resolved = await prisma.serviceRequest.count({
          where: {
            assignedToStaff: s.name,
            status: { in: ['Resolved', 'Closed'] },
          },
        });
        return {
          id: s.id,
          name: s.name,
          activeCount: active,
          resolvedCount: resolved,
          capacityPercent: Math.min(100, (active / 5) * 100),
          isOccupied: active >= 5,
        };
      })
    );

    return res.json({
      stats: {
        totalRequests,
        pendingRequests,
        inProgressRequests,
        resolvedRequests,
        closedRequests,
        highPriorityRequests,
      },
      recentRequests,
      roomAnalytics,
      departmentStats,
      staffWorkload,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
};

module.exports = {
  getDashboardStats,
};
