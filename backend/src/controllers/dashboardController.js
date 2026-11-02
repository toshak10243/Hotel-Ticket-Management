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
      take: 6,
      orderBy: { createdAt: 'desc' },
    });

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
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return res.status(500).json({ error: 'Failed to retrieve dashboard statistics' });
  }
};

module.exports = {
  getDashboardStats,
};

