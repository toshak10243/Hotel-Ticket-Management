const prisma = require('../config/db');
const { generateTicketId } = require('../utils/ticketGenerator');

// POST /api/requests (Guest submission)
const createGuestRequest = async (req, res) => {
  try {
    const { roomNumber, category, requestType, description, priority } = req.body;

    if (!roomNumber || !category || !requestType || !description) {
      return res.status(400).json({ error: 'Room number, category, request type and description are required.' });
    }

    // Generate unique ticket ID with collision check
    let ticketId = generateTicketId();
    let existing = await prisma.serviceRequest.findUnique({ where: { ticketId } });
    while (existing) {
      ticketId = generateTicketId();
      existing = await prisma.serviceRequest.findUnique({ where: { ticketId } });
    }

    const newRequest = await prisma.serviceRequest.create({
      data: {
        ticketId,
        roomNumber: String(roomNumber).trim(),
        category,
        requestType,
        description: description.trim(),
        priority: priority || 'Low',
        status: 'Pending',
      },
    });

    // Create initial history record
    await prisma.requestHistory.create({
      data: {
        requestId: newRequest.id,
        previousStatus: 'Pending',
        newStatus: 'Pending',
        remarks: 'Request submitted by guest through room QR portal.',
      },
    });

    return res.status(201).json({
      message: 'Request submitted successfully!',
      request: newRequest,
    });
  } catch (error) {
    console.error('Create request error:', error);
    return res.status(500).json({ error: 'Failed to submit request. Please try again.' });
  }
};

// GET /api/requests/track/:ticketId (Guest tracking)
const trackGuestRequest = async (req, res) => {
  try {
    const { ticketId } = req.params;
    if (!ticketId) {
      return res.status(400).json({ error: 'Ticket ID is required' });
    }

    const request = await prisma.serviceRequest.findUnique({
      where: { ticketId: ticketId.trim() },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            previousStatus: true,
            newStatus: true,
            remarks: true,
            createdAt: true,
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'No request found with this ticket ID. Please check and try again.' });
    }

    return res.json({ request });
  } catch (error) {
    console.error('Track request error:', error);
    return res.status(500).json({ error: 'Error tracking request' });
  }
};

// GET /api/requests (Staff: list with filtering & search)
const getAllRequests = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority;
    }

    if (search && search.trim() !== '') {
      const query = search.trim();
      where.OR = [
        { ticketId: { contains: query, mode: 'insensitive' } },
        { roomNumber: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const requests = await prisma.serviceRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { history: true },
        },
      },
    });

    return res.json({ requests });
  } catch (error) {
    console.error('Get all requests error:', error);
    return res.status(500).json({ error: 'Failed to retrieve requests' });
  }
};

// GET /api/requests/:id (Staff: request details)
const getRequestById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }

    const request = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
          include: {
            updatedBy: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    return res.json({ request });
  } catch (error) {
    console.error('Get request by ID error:', error);
    return res.status(500).json({ error: 'Failed to retrieve request details' });
  }
};

// PATCH /api/requests/:id (Staff/Manager/Admin update)
const updateRequest = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }

    const { status, assignedDepartment, remarks, priority } = req.body;

    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (assignedDepartment !== undefined) updateData.assignedDepartment = assignedDepartment;
    if (priority) updateData.priority = priority;

    const previousStatus = existing.status;
    const newStatus = status || existing.status;

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
    });

    // Create history entry
    const staffRemark = remarks || (status ? `Status updated to ${newStatus}` : 'Request details modified');
    await prisma.requestHistory.create({
      data: {
        requestId: id,
        previousStatus,
        newStatus,
        remarks: staffRemark,
        updatedById: req.user ? req.user.id : null,
      },
    });

    const fullRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
          include: {
            updatedBy: {
              select: { id: true, name: true, role: true },
            },
          },
        },
      },
    });

    return res.json({
      message: 'Request updated successfully',
      request: fullRequest,
    });
  } catch (error) {
    console.error('Update request error:', error);
    return res.status(500).json({ error: 'Failed to update request' });
  }
};

// GET /api/requests/:id/history
const getRequestHistory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }

    const history = await prisma.requestHistory.findMany({
      where: { requestId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        updatedBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    return res.json({ history });
  } catch (error) {
    console.error('Get request history error:', error);
    return res.status(500).json({ error: 'Failed to retrieve request history' });
  }
};

module.exports = {
  createGuestRequest,
  trackGuestRequest,
  getAllRequests,
  getRequestById,
  updateRequest,
  getRequestHistory,
};

